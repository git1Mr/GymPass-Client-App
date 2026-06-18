const express = require('express');
const bcrypt  = require('bcrypt');
const crypto  = require('crypto');
const Joi     = require('joi');
const winston = require('winston');
const router  = express.Router();

const { User } = require('../models/user');
const { setSessionCookies, clearSessionCookies } = require('../utils/sessionCookies');
const { sendPasswordResetEmail } = require('../utils/mailer');

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
  setSessionCookies(res, token);
  res.header('x-auth-token', token).send({ token });
});

// POST /api/auth/logout
// Clears the cross-subdomain session cookies (uf_token + uf_authed). The
// HttpOnly token cookie can only be removed server-side, so the web client
// calls this on logout in addition to wiping its own localStorage.
router.post('/logout', (_req, res) => {
  clearSessionCookies(res);
  res.send({ message: 'Logged out.' });
});

// POST /api/auth/forgot-password
// Issues a short-lived reset token and emails it (SMTP). Always responds with
// the same generic message so the endpoint never leaks which emails are
// registered. The raw token is never returned in the HTTP response.
const GENERIC_RESET_MESSAGE = 'Si cet e-mail existe, un code de réinitialisation a été envoyé.';

router.post('/forgot-password', async (req, res) => {
  const { error, value } = Joi.object({
    email: Joi.string().email().required()
  }).validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: value.email });
  // Always respond 200 — never leak whether the email is registered.
  if (!user) return res.send({ message: GENERIC_RESET_MESSAGE });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash    = hashToken(token);
  user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, token, RESET_TOKEN_TTL_MS / 60000);
  } catch (e) {
    // Don't surface SMTP failures to the caller (would leak account existence
    // and expose infra detail). Log it; the user can simply retry.
    winston.error('Failed to send password-reset email', { message: e.message });
  }

  res.send({ message: GENERIC_RESET_MESSAGE });
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
