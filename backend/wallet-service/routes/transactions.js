const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

const { Transaction, validatePurchase, validateDeduction } = require('../models/transaction');
const { User }         = require('../models/user');
const { Gym }          = require('../models/gym');
const { PointsConfig } = require('../models/pointsconfig');
const auth             = require('../middleware/auth');
const admin            = require('../middleware/admin');
const gymStaff         = require('../middleware/gymstaff');

router.get('/me', auth, async (req, res) => {
  const txs = await Transaction.find({ userId: req.user._id })
    .populate('gymId', 'name city tier')
    .sort({ createdAt: -1 })
    .limit(100);
  res.send(txs);
});

router.get('/gym/:gymId', [auth, gymStaff], async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const txs = await Transaction.find({
    gymId:     req.params.gymId,
    type:      'deduction',
    createdAt: { $gte: startOfDay }
  })
    .populate('userId', 'name email status')
    .sort({ createdAt: -1 });

  res.send(txs);
});

// Occupancy proxy — count of check-ins in a trailing window vs gym capacity.
// (No check-out event exists, so this is an approximation.)
router.get('/gym/:gymId/occupancy', [auth, gymStaff], async (req, res) => {
  const hours = Math.min(24, Math.max(1, Number(req.query.hours) || 2));
  const since = new Date(Date.now() - hours * 3600 * 1000);
  const current = await Transaction.countDocuments({
    gymId: req.params.gymId, type: 'deduction', createdAt: { $gte: since }
  });
  const gym = await Gym.findById(req.params.gymId).select('capacity acceptingCheckins');
  res.send({
    current,
    capacity: gym?.capacity ?? 100,
    acceptingCheckins: gym?.acceptingCheckins ?? true,
    windowHours: hours
  });
});

// Analytics — peak hours + popular days + totals over the trailing N days.
router.get('/gym/:gymId/analytics', [auth, gymStaff], async (req, res) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
  const since = new Date(Date.now() - days * 86400 * 1000);
  const txs = await Transaction.find({
    gymId: req.params.gymId, type: 'deduction', createdAt: { $gte: since }
  }).select('createdAt userId');

  const peakHours   = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  const popularDays = Array.from({ length: 7 },  (_, d) => ({ day: d,  count: 0 })); // 0 = Sunday
  const members = new Set();
  for (const t of txs) {
    const dt = new Date(t.createdAt);
    peakHours[dt.getHours()].count++;
    popularDays[dt.getDay()].count++;
    if (t.userId) members.add(String(t.userId));
  }

  res.send({
    windowDays:    days,
    totalCheckins: txs.length,
    uniqueMembers: members.size,
    peakHours,
    popularDays
  });
});

router.post('/purchase', auth, async (req, res) => {
  const { error } = validatePurchase({ ...req.body, userId: req.user._id });
  if (error) return res.status(400).send(error.details[0].message);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tx = new Transaction({
      userId:        req.user._id,
      type:          'purchase',
      pointsAmount:  req.body.pointsAmount,
      amountPaidMAD: req.body.amountPaidMAD,
      packLabel:     req.body.packLabel || null
    });
    await tx.save({ session });

    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { pointsBalance: req.body.pointsAmount } },
      { session }
    );

    await session.commitTransaction();
    res.status(201).send(tx);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

router.post('/deduct', auth, async (req, res) => {
  const { error } = validateDeduction({ ...req.body, userId: req.user._id });
  if (error) return res.status(400).send(error.details[0].message);

  const gym = await Gym.findById(req.body.gymId);
  if (!gym || gym.status !== 'active') return res.status(404).send('Gym not found or inactive.');

  const cfg = await PointsConfig.findOne({ tier: gym.tier });
  if (!cfg) return res.status(500).send('Points config not found for this tier.');

  const pointsToDeduct = cfg.pointsPerSession;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(req.user._id).session(session);
    if (user.pointsBalance < pointsToDeduct) {
      await session.abortTransaction();
      return res.status(400).send('Insufficient points balance.');
    }

    const tx = new Transaction({
      userId:       req.user._id,
      gymId:        req.body.gymId,
      type:         'deduction',
      pointsAmount: pointsToDeduct,
      source:       req.body.source || 'online',
      qrTokenHash:  req.body.qrTokenHash || null,
      offlineSynced: req.body.source === 'offline' ? false : true
    });
    await tx.save({ session });

    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { pointsBalance: -pointsToDeduct } },
      { session }
    );

    await session.commitTransaction();
    res.status(201).send({ transaction: tx, remainingBalance: user.pointsBalance - pointsToDeduct });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

router.get('/offline-audit', [auth, admin], async (_req, res) => {
  const txs = await Transaction.find({ source: 'offline', offlineSynced: false })
    .populate('userId', 'name email')
    .populate('gymId', 'name city')
    .sort({ createdAt: -1 });
  res.send(txs);
});

module.exports = router;
