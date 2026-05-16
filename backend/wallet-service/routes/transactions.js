const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

const { Transaction, validatePurchase, validateDeduction } = require('../models/transaction');
const { User }         = require('../models/user');
const { Gym }          = require('../models/gym');
const { PointsConfig } = require('../models/pointsconfig');
const auth             = require('../middleware/auth');
const admin            = require('../middleware/admin');

router.get('/me', auth, async (req, res) => {
  const txs = await Transaction.find({ userId: req.user._id })
    .populate('gymId', 'name city tier')
    .sort({ createdAt: -1 })
    .limit(100);
  res.send(txs);
});

router.get('/gym/:gymId', auth, async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const txs = await Transaction.find({
    gymId:     req.params.gymId,
    type:      'deduction',
    createdAt: { $gte: startOfDay }
  })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.send(txs);
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
