const mongoose = require('mongoose');

const pointsConfigSchema = new mongoose.Schema({
  tier:                   { type: Number, enum: [1, 2, 3], required: true, unique: true },
  label:                  { type: String, enum: ['Standard', 'Premium', 'Elite'], required: true },
  pointsPerSession:       { type: Number, required: true, min: 1 },
  cashPerPointMAD:        { type: Number, required: true, min: 0 },
  salePricePerPointMAD:   { type: Number, required: true, min: 0 },
  platformCommissionRate: { type: Number, required: true, min: 0, max: 1 }
}, { timestamps: true });

const PointsConfig = mongoose.models.PointsConfig || mongoose.model('PointsConfig', pointsConfigSchema);
module.exports = { PointsConfig };
