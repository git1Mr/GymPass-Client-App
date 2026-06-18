const express = require('express');
const router  = express.Router();

const { Gym, validateGym } = require('../models/gym');
const auth             = require('../middleware/auth');
const admin            = require('../middleware/admin');
const gymStaff         = require('../middleware/gymstaff');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', async (req, res) => {
  const filter = { status: 'active' };
  if (req.query.tier) filter.tier = Number(req.query.tier);

  if (req.query.lng && req.query.lat) {
    const maxMeters = (Number(req.query.maxKm) || 10) * 1000;
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(req.query.lng), Number(req.query.lat)] },
        $maxDistance: maxMeters
      }
    };
  }

  const gyms = await Gym.find(filter).select('-__v');
  res.send(gyms);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const gym = await Gym.findById(req.params.id).select('-__v');
  if (!gym) return res.status(404).send('Gym not found.');
  res.send(gym);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validateGym(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const gym = new Gym({
    name:             req.body.name,
    city:             req.body.city,
    location:         { type: 'Point', coordinates: req.body.coordinates },
    tier:             req.body.tier,
    pointsPerSession: req.body.pointsPerSession,
    equipment:        req.body.equipment || [],
    description:      req.body.description || ''
  });

  await gym.save();
  res.status(201).send(gym);
});

router.put('/:id', [auth, gymStaff, validateObjectId], async (req, res) => {
  // Non-admins (gym_staff / gym_admin) may only edit their own gym.
  if (!req.user.isAdmin && String(req.user.gymId) !== req.params.id)
    return res.status(403).send('Access denied. You can only manage your own gym.');

  const ALLOWED = ['name', 'city', 'description', 'capacity', 'acceptingCheckins', 'equipment', 'openingHours', 'photos'];
  const update = {};
  for (const k of ALLOWED) if (req.body[k] !== undefined) update[k] = req.body[k];

  const gym = await Gym.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
  if (!gym) return res.status(404).send('Gym not found.');
  res.send(gym);
});

router.put('/:id/status', [auth, admin, validateObjectId], async (req, res) => {
  const gym = await Gym.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!gym) return res.status(404).send('Gym not found.');
  res.send(gym);
});

module.exports = router;
