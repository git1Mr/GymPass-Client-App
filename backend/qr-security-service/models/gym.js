const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  city:             { type: String, required: true, trim: true },
  location:         { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number] } },
  tier:             { type: Number, enum: [1, 2, 3], required: true },
  pointsPerSession: { type: Number, required: true, min: 1 },
  status:           { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' }
}, { timestamps: true, strict: false });

const Gym = mongoose.models.Gym || mongoose.model('Gym', gymSchema);
module.exports = { Gym };
