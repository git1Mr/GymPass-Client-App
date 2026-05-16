const mongoose = require('mongoose');
const Joi = require('joi');

const pointsConfigSchema = new mongoose.Schema({
  tier:                   { type: Number, enum: [1, 2, 3], required: true, unique: true },
  label:                  { type: String, enum: ['Standard', 'Premium', 'Elite'], required: true },
  pointsPerSession:       { type: Number, required: true, min: 1 },
  cashPerPointMAD:        { type: Number, required: true, min: 0 },
  salePricePerPointMAD:   { type: Number, required: true, min: 0 },
  platformCommissionRate: { type: Number, required: true, min: 0, max: 1 }
}, { timestamps: true });

const PointsConfig = mongoose.models.PointsConfig || mongoose.model('PointsConfig', pointsConfigSchema);

async function seedDefaultConfig() {
  const count = await PointsConfig.countDocuments();
  if (count > 0) return;
  await PointsConfig.insertMany([
    { tier: 1, label: 'Standard', pointsPerSession: 1, cashPerPointMAD: 10, salePricePerPointMAD: 10, platformCommissionRate: 0.15 },
    { tier: 2, label: 'Premium',  pointsPerSession: 3, cashPerPointMAD: 10, salePricePerPointMAD: 10, platformCommissionRate: 0.15 },
    { tier: 3, label: 'Elite',    pointsPerSession: 5, cashPerPointMAD: 10, salePricePerPointMAD: 10, platformCommissionRate: 0.15 }
  ]);
  console.log('PointsConfig seeded with defaults.');
}

function validatePointsConfig(c) {
  return Joi.object({
    tier:                   Joi.number().valid(1, 2, 3).required(),
    label:                  Joi.string().valid('Standard', 'Premium', 'Elite').required(),
    pointsPerSession:       Joi.number().min(1).required(),
    cashPerPointMAD:        Joi.number().min(0).required(),
    salePricePerPointMAD:   Joi.number().min(0).required(),
    platformCommissionRate: Joi.number().min(0).max(1).required()
  }).validate(c);
}

module.exports = { PointsConfig, pointsConfigSchema, validatePointsConfig, seedDefaultConfig };
