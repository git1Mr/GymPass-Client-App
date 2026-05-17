const mongoose = require('mongoose');
const { Transaction }  = require('../models/transaction');
const { Gym }          = require('../models/gym');
const { PointsConfig } = require('../models/pointsconfig');

async function computeBalance(userId, session = null) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const result = await Transaction.aggregate([
    { $match: { userId: userObjectId, status: 'confirmed' } },
    { $group: {
        _id: null,
        totalCredits: { $sum: { $cond: [{ $eq: ['$type', 'purchase'] },  '$pointsAmount', 0] } },
        totalDebits:  { $sum: { $cond: [{ $eq: ['$type', 'deduction'] }, '$pointsAmount', 0] } }
    } },
    { $project: { _id: 0, balance: { $subtract: ['$totalCredits', '$totalDebits'] } } }
  ]).session(session ?? null);
  return result[0]?.balance ?? 0;
}

async function processGymAccess({ userId, gymId, qrToken, qrExpiresAt }) {
  if (Date.now() > qrExpiresAt) {
    const err = new Error('QR code has expired. Please generate a new pass.');
    err.statusCode = 400; throw err;
  }

  const alreadyUsed = await Transaction.findOne({ qrTokenHash: qrToken });
  if (alreadyUsed) {
    const err = new Error('This QR code has already been used.');
    err.statusCode = 400; throw err;
  }

  const gym = await Gym.findById(gymId);
  if (!gym || gym.status !== 'active') {
    const err = new Error('Gym not found or currently inactive.');
    err.statusCode = 404; throw err;
  }

  const cfg = await PointsConfig.findOne({ tier: gym.tier });
  if (!cfg) {
    const err = new Error(`No points configuration found for tier ${gym.tier}.`);
    err.statusCode = 500; throw err;
  }

  const pointsRequired = cfg.pointsPerSession;
  const session = await mongoose.startSession();
  session.startTransaction({
    readConcern:  { level: 'snapshot' },
    writeConcern: { w: 'majority' }
  });

  try {
    const currentBalance = await computeBalance(userId, session);
    if (currentBalance < pointsRequired) {
      await session.abortTransaction();
      const err = new Error(`Insufficient points. Required: ${pointsRequired}, available: ${currentBalance}.`);
      err.statusCode = 402; throw err;
    }

    const [debitTx] = await Transaction.create([{
      userId:        new mongoose.Types.ObjectId(userId),
      gymId:         new mongoose.Types.ObjectId(gymId),
      type:          'deduction',
      pointsAmount:  pointsRequired,
      source:        'online',
      status:        'confirmed',
      qrTokenHash:   qrToken,
      offlineSynced: true
    }], { session });

    await session.commitTransaction();
    return {
      success:          true,
      transactionId:    debitTx._id.toString(),
      pointsDeducted:   pointsRequired,
      remainingBalance: currentBalance - pointsRequired,
      gym: { name: gym.name, city: gym.city, tier: gym.tier }
    };
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = { processGymAccess, computeBalance };
