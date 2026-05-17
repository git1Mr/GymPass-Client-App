const express = require('express');
const router  = express.Router();

const { Settlement }   = require('../models/settlement');
const { Transaction }  = require('../models/transaction');
const { PointsConfig } = require('../models/pointsconfig');
const { Gym }          = require('../models/gym');
const auth             = require('../middleware/auth');
const admin            = require('../middleware/admin');
const gymStaff         = require('../middleware/gymstaff');

router.get('/', [auth, admin], async (_req, res) => {
  const settlements = await Settlement.find()
    .populate('gymId', 'name city tier')
    .sort({ year: -1, month: -1 });
  res.send(settlements);
});

router.get('/gym/:gymId', [auth, gymStaff], async (req, res) => {
  const settlements = await Settlement.find({ gymId: req.params.gymId })
    .sort({ year: -1, month: -1 });
  res.send(settlements);
});

router.post('/run', [auth, admin], async (req, res) => {
  const { month, year } = req.body;
  if (!month || !year) return res.status(400).send('month and year are required.');

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const gyms = await Gym.find({ status: 'active' });
  const results = [];

  for (const gym of gyms) {
    const agg = await Transaction.aggregate([
      { $match: {
          gymId:     gym._id,
          type:      'deduction',
          status:    'confirmed',
          createdAt: { $gte: start, $lt: end }
      } },
      { $group: { _id: null, total: { $sum: '$pointsAmount' } } }
    ]);

    const totalPoints = agg[0]?.total || 0;
    if (totalPoints === 0) continue;

    const cfg = await PointsConfig.findOne({ tier: gym.tier });
    const gross      = totalPoints * cfg.cashPerPointMAD;
    const commission = gross * cfg.platformCommissionRate;
    const net        = gross - commission;

    const settlement = await Settlement.findOneAndUpdate(
      { gymId: gym._id, month, year },
      { $set: {
          totalPointsConsumed: totalPoints,
          grossPayoutMAD:      gross,
          commissionMAD:       commission,
          netPayoutMAD:        net,
          status:              'pending'
      } },
      { upsert: true, new: true }
    );
    results.push(settlement);
  }

  res.send({ processed: results.length, settlements: results });
});

router.put('/:id/status', [auth, admin], async (req, res) => {
  const update = { status: req.body.status };
  if (req.body.status === 'paid') update.paidAt = new Date();

  const settlement = await Settlement.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!settlement) return res.status(404).send('Settlement not found.');
  res.send(settlement);
});

module.exports = router;
