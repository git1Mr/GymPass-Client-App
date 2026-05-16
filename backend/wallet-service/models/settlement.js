const mongoose = require('mongoose');
const Joi = require('joi');

const settlementSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year:  { type: Number, required: true, min: 2024 },
  totalPointsConsumed: { type: Number, required: true, min: 0 },
  grossPayoutMAD:      { type: Number, required: true, min: 0 },
  commissionMAD:       { type: Number, required: true, min: 0 },
  netPayoutMAD:        { type: Number, required: true, min: 0 },
  breakagePointsMAD:   { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
  paidAt: { type: Date, default: null },
  notes:  { type: String, default: '' }
}, { timestamps: true });

settlementSchema.index({ gymId: 1, month: 1, year: 1 }, { unique: true });

const Settlement = mongoose.models.Settlement || mongoose.model('Settlement', settlementSchema);

function validateSettlement(data) {
  return Joi.object({
    gymId:               Joi.string().required(),
    month:               Joi.number().min(1).max(12).required(),
    year:                Joi.number().min(2024).required(),
    totalPointsConsumed: Joi.number().min(0).required(),
    grossPayoutMAD:      Joi.number().min(0).required(),
    commissionMAD:       Joi.number().min(0).required(),
    netPayoutMAD:        Joi.number().min(0).required()
  }).validate(data);
}

module.exports = { Settlement, settlementSchema, validateSettlement };
