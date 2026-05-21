const mongoose = require('mongoose');
const Joi = require('joi');

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
transactionSchema.index({ source: 1, offlineSynced: 1 });
// `sparse: true` does NOT exclude documents where the field is explicitly set
// to null — and our schema defaults stripePaymentIntentId to null. Use a
// partial filter so only documents with an actual string id are indexed.
transactionSchema.index(
  { stripePaymentIntentId: 1 },
  { unique: true, partialFilterExpression: { stripePaymentIntentId: { $type: 'string' } } }
);

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

function validatePurchase(data) {
  return Joi.object({
    userId:        Joi.string().required(),
    pointsAmount:  Joi.number().min(1).required(),
    amountPaidMAD: Joi.number().min(0).required(),
    packLabel:     Joi.string().optional()
  }).validate(data);
}

function validateDeduction(data) {
  return Joi.object({
    userId:       Joi.string().required(),
    gymId:        Joi.string().required(),
    pointsAmount: Joi.number().min(1).required(),
    source:       Joi.string().valid('online', 'offline').default('online'),
    qrTokenHash:  Joi.string().optional()
  }).validate(data);
}

module.exports = { Transaction, transactionSchema, validatePurchase, validateDeduction };
