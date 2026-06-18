const express = require('express');
const bcrypt  = require('bcrypt');
const crypto  = require('crypto');
const Joi     = require('joi');
const _       = require('lodash');
const router  = express.Router();

const { User, validateUser } = require('../models/user');
const { setSessionCookies } = require('../utils/sessionCookies');
const auth             = require('../middleware/auth');
const admin            = require('../middleware/admin');
const gymAdmin         = require('../middleware/gymadmin');
const validateObjectId = require('../middleware/validateObjectId');

const PUBLIC_FIELDS = ['_id', 'name', 'email', 'role', 'gymId', 'phone', 'status'];

// Validate an account created by a privileged user (admin / club admin).
// deviceId is generated server-side, so it isn't part of the payload.
function validateNewUser(body, roles) {
  return Joi.object({
    name:     Joi.string().min(2).max(100).required(),
    email:    Joi.string().email().required(),
    password: Joi.string().min(8).max(1024).required(),
    role:     Joi.string().valid(...roles).required(),
    gymId:    Joi.string().optional().allow(null, ''),
    phone:    Joi.string().max(40).optional().allow(null, ''),
  }).validate(body);
}

// Persist a new user. A web-prefixed deviceId lets them log in from any
// browser (the auth-service bypasses device-binding for "web-" ids).
async function createUserDoc({ name, email, password, role, gymId, phone }) {
  const salt = await bcrypt.genSalt(10);
  const user = new User({
    name,
    email,
    password: await bcrypt.hash(password, salt),
    deviceId: `web-${crypto.randomUUID()}`,
    role,
    gymId: gymId || null,
    phone: phone || null,
  });
  await user.save();
  return user;
}

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
  setSessionCookies(res, token);
  res.header('x-auth-token', token)
     .send(_.pick(user, ['_id', 'name', 'email', 'role', 'pointsBalance']));
});

// POST /api/users/admin-create — platform admin creates a user of any gym-side
// role (member / gym_staff / gym_admin), optionally tied to a gym. Does NOT set
// session cookies (the admin keeps their own session).
router.post('/admin-create', [auth, admin], async (req, res) => {
  const { error } = validateNewUser(req.body, ['member', 'gym_staff', 'gym_admin']);
  if (error) return res.status(400).send(error.details[0].message);

  if ((req.body.role === 'gym_staff' || req.body.role === 'gym_admin') && !req.body.gymId)
    return res.status(400).send('A gym must be assigned for staff / club-admin accounts.');

  if (await User.findOne({ email: req.body.email }))
    return res.status(400).send('Email already registered.');

  const user = await createUserDoc(req.body);
  res.status(201).send(_.pick(user, PUBLIC_FIELDS));
});

// GET /api/users/staff — a club admin lists the reception staff of their gym.
router.get('/staff', [auth, gymAdmin], async (req, res) => {
  if (!req.user.gymId) return res.status(400).send('Your account is not linked to a gym.');
  const staff = await User.find({ role: 'gym_staff', gymId: req.user.gymId })
    .select('-password').sort('name');
  res.send(staff);
});

// POST /api/users/staff — a club admin creates reception staff, forced to their
// own gym (gymId comes from the token, never the client).
router.post('/staff', [auth, gymAdmin], async (req, res) => {
  if (!req.user.gymId) return res.status(400).send('Your account is not linked to a gym.');
  const body = { name: req.body.name, email: req.body.email, password: req.body.password,
    phone: req.body.phone, role: 'gym_staff', gymId: req.user.gymId };

  const { error } = validateNewUser(body, ['gym_staff']);
  if (error) return res.status(400).send(error.details[0].message);
  if (await User.findOne({ email: body.email }))
    return res.status(400).send('Email already registered.');

  const user = await createUserDoc(body);
  res.status(201).send(_.pick(user, PUBLIC_FIELDS));
});

// PUT /api/users/staff/:id/status — a club admin revokes/reactivates one of
// their own reception staff (gym-scoped; can't touch other gyms or roles).
router.put('/staff/:id/status', [auth, gymAdmin, validateObjectId], async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'gym_staff', gymId: req.user.gymId });
  if (!user) return res.status(404).send('Staff member not found.');
  user.status = req.body.status;
  await user.save();
  res.send(_.pick(user, PUBLIC_FIELDS));
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
