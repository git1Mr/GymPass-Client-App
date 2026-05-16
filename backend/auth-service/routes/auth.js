const express = require('express');
const bcrypt  = require('bcrypt');
const Joi     = require('joi');
const router  = express.Router();

const { User } = require('../models/user');

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

  if (user.deviceId !== req.body.deviceId)
    return res.status(403).send('This account is linked to a different device.');

  if (user.status === 'suspended')
    return res.status(403).send('Account suspended. Contact support.');

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send({ token });
});

module.exports = router;
