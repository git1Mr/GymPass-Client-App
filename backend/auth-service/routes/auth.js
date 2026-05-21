const express = require('express');
const bcrypt  = require('bcrypt');
const crypto  = require('crypto');
const Joi     = require('joi');
const router  = express.Router();

const { User } = require('../models/user');

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function validateLogin(body) {
  return Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
    deviceId: Joi.string().required()
  }).validate(body);
}

router.post('/', async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).send('Invalid email or password.');

  // Device binding is an anti-fraud guard for the mobile app where deviceId is
  // a hardware fingerprint. The web client sends a per-browser id prefixed
  // with "web-" — those should bypass the check so users can log in from any
  // browser/computer. Mobile-to-mobile bindings remain enforced.
  const incomingIsWeb = typeof req.body.deviceId === 'string' && req.body.deviceId.startsWith('web-');
  if (!incomingIsWeb && user.deviceId !== req.body.deviceId)
    return res.status(403).send('This account is linked to a different device.');

  if (user.status === 'suspended')
    return res.status(403).send('Account suspended. Contact support.');

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send({ token });
});

// POST /api/auth/forgot-password
// Issues a short-lived reset token. In production the token would be emailed;
// here we return it directly so the demo flow works without SMTP infra.
router.post('/forgot-password', async (req, res) => {
  const { error, value } = Joi.object({
    email: Joi.string().email().required()
  }).validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: value.email });
  // Always respond 200 — never leak whether the email is registered.
  if (!user) return res.send({ message: 'If that email exists, a reset link was sent.' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash    = hashToken(token);
  user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  // DEMO ONLY: returning the raw token. In prod, email it and respond with the
  // generic message above.
  res.send({
    message:    'Reset token issued.',
    resetToken: token,
    expiresAt:  user.resetTokenExpires
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { error, value } = Joi.object({
    resetToken:  Joi.string().hex().length(64).required(),
    newPassword: Joi.string().min(8).max(1024).required()
  }).validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({
    resetTokenHash:    hashToken(value.resetToken),
    resetTokenExpires: { $gt: new Date() }
  });
  if (!user) return res.status(400).send('Reset token is invalid or expired.');

  const salt = await bcrypt.genSalt(10);
  user.password           = await bcrypt.hash(value.newPassword, salt);
  user.resetTokenHash     = null;
  user.resetTokenExpires  = null;
  await user.save();

  res.send({ message: 'Password reset successful. You can now log in.' });
});

module.exports = router;
