// Read-only reference for settlement-engine (it aggregates deductions per gym).
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gymId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Gym',  default: null },
  type:         { type: String, enum: ['purchase', 'deduction'] },
  pointsAmount: { type: Number, min: 1 },
  status:       { type: String, enum: ['confirmed', 'failed', 'pending'], default: 'confirmed' }
}, { timestamps: true, versionKey: false, strict: false });

transactionSchema.index({ gymId: 1, type: 1, createdAt: 1 });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
module.exports = { Transaction };
