const express = require('express');
const bcrypt  = require('bcrypt');
const _       = require('lodash');
const router  = express.Router();

const { User, validateUser } = require('../models/user');
const auth             = require('../middleware/auth');
const admin            = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

router.get('/', [auth, admin], async (_req, res) => {
  const users = await User.find().select('-password').sort('name');
  res.send(users);
});

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (await User.findOne({ email: req.body.email }))
    return res.status(400).send('Email already registered.');

  if (await User.findOne({ deviceId: req.body.deviceId }))
    return res.status(400).send('This device is already linked to an account.');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name:     req.body.name,
    email:    req.body.email,
    password: passwordHash,
    deviceId: req.body.deviceId,
    role:     req.body.role || 'member',
    gymId:    req.body.gymId
  });

  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token)
     .send(_.pick(user, ['_id', 'name', 'email', 'role', 'pointsBalance']));
});

router.put('/:id/status', [auth, admin, validateObjectId], async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) return res.status(404).send('User not found.');
  res.send(user);
});

module.exports = router;
