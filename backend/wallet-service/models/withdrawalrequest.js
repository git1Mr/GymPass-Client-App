const mongoose = require('mongoose');
const Joi = require('joi');

const withdrawalRequestSchema = new mongoose.Schema({
  gymId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Gym',  required: true },
  requestedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amountRequestedMAD: { type: Number, required: true, min: 1 },
  bankDetails: {
    accountHolder: { type: String, required: true, trim: true },
    iban:          { type: String, required: true, trim: true },
    bankName:      { type: String, required: true, trim: true }
  },
  status:           { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  adminNote:        { type: String, default: '' },
  resolvedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt:       { type: Date, default: null }
}, { timestamps: true });

withdrawalRequestSchema.index({ gymId: 1, status: 1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });

const WithdrawalRequest = mongoose.models.WithdrawalRequest || mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

function validateWithdrawalRequest(data) {
  return Joi.object({
    gymId:              Joi.string().required(),
    requestedByUserId:  Joi.string().required(),
    amountRequestedMAD: Joi.number().min(1).required(),
    bankDetails: Joi.object({
      accountHolder: Joi.string().required(),
      iban:          Joi.string().required(),
      bankName:      Joi.string().required()
    }).required()
  }).validate(data);
}

module.exports = { WithdrawalRequest, withdrawalRequestSchema, validateWithdrawalRequest };
