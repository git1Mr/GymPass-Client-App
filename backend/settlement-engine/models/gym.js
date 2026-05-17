const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  city:   { type: String, required: true, trim: true },
  tier:   { type: Number, enum: [1, 2, 3], required: true },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' }
}, { timestamps: true, strict: false });

const Gym = mongoose.models.Gym || mongoose.model('Gym', gymSchema);
module.exports = { Gym };
