const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gymId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Gym',  default: null },
  type:          { type: String, enum: ['purchase', 'deduction'], required: true },
  pointsAmount:  { type: Number, required: true, min: 1 },
  amountPaidMAD: { type: Number, default: null },
  packLabel:     { type: String, default: null },
  source:        { type: String, enum: ['online', 'offline'], default: 'online' },
  offlineSynced: { type: Boolean, default: true },
  status:        { type: String, enum: ['confirmed', 'failed', 'pending'], default: 'confirmed' },
  qrTokenHash:   { type: String, default: null },
  provider:      { type: String, enum: ['stripe', 'cash', 'cmi', null], default: null },
  stripePaymentIntentId: { type: String, default: null },
  currency:      { type: String, default: null }
}, { timestamps: true, versionKey: false });

transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ gymId: 1, type: 1, createdAt: 1 });
transactionSchema.index({ qrTokenHash: 1 }, { sparse: true });
transactionSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
module.exports = { Transaction, transactionSchema };
