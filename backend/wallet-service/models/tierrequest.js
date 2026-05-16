const mongoose = require('mongoose');
const Joi = require('joi');

const tierRequestSchema = new mongoose.Schema({
  gymId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Gym',  required: true },
  requestedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentTier:       { type: Number, enum: [1, 2, 3], required: true },
  requestedTier:     { type: Number, enum: [1, 2, 3], required: true },
  justification:     { type: String, required: true, minlength: 10, maxlength: 1000 },
  supportingDocs:    { type: [String], default: [] },
  status:            { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote:         { type: String, default: '' },
  resolvedByUserId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt:        { type: Date, default: null }
}, { timestamps: true });

tierRequestSchema.index({ gymId: 1, status: 1 });
tierRequestSchema.index({ status: 1, createdAt: -1 });

const TierRequest = mongoose.models.TierRequest || mongoose.model('TierRequest', tierRequestSchema);

function validateTierRequest(data) {
  return Joi.object({
    gymId:             Joi.string().required(),
    requestedByUserId: Joi.string().required(),
    currentTier:       Joi.number().valid(1, 2, 3).required(),
    requestedTier:     Joi.number().valid(1, 2, 3).required(),
    justification:     Joi.string().min(10).max(1000).required(),
    supportingDocs:    Joi.array().items(Joi.string().uri()).optional()
  }).validate(data);
}

module.exports = { TierRequest, tierRequestSchema, validateTierRequest };
