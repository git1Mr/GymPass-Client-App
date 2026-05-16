const express = require('express');
const router  = express.Router();

const { PointsConfig, validatePointsConfig } = require('../models/pointsconfig');
const auth  = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', async (_req, res) => {
  const configs = await PointsConfig.find().sort('tier');
  res.send(configs);
});

router.put('/:tier', [auth, admin], async (req, res) => {
  const tier = Number(req.params.tier);
  if (![1, 2, 3].includes(tier)) return res.status(400).send('Tier must be 1, 2, or 3.');

  const { error } = validatePointsConfig({ ...req.body, tier });
  if (error) return res.status(400).send(error.details[0].message);

  const cfg = await PointsConfig.findOneAndUpdate(
    { tier },
    { $set: req.body },
    { new: true, runValidators: true, upsert: true }
  );
  res.send(cfg);
});

module.exports = router;
