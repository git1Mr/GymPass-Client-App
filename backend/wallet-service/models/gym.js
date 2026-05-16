const mongoose = require('mongoose');
const Joi = require('joi');

const openingHoursSchema = new mongoose.Schema({
  monday:    { open: String, close: String },
  tuesday:   { open: String, close: String },
  wednesday: { open: String, close: String },
  thursday:  { open: String, close: String },
  friday:    { open: String, close: String },
  saturday:  { open: String, close: String },
  sunday:    { open: String, close: String }
}, { _id: false });

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  tier: { type: Number, enum: [1, 2, 3], required: true },
  pointsPerSession: { type: Number, required: true, min: 1 },
  equipment: { type: [String], default: [] },
  openingHours: { type: openingHoursSchema, default: {} },
  description: { type: String, maxlength: 1000, default: '' },
  photos: { type: [String], default: [] },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' }
}, { timestamps: true });

gymSchema.index({ location: '2dsphere' });

const Gym = mongoose.models.Gym || mongoose.model('Gym', gymSchema);

function validateGym(gym) {
  const schema = Joi.object({
    name:             Joi.string().min(2).max(150).required(),
    city:             Joi.string().max(100).required(),
    coordinates:      Joi.array().items(Joi.number()).length(2).required(),
    tier:             Joi.number().valid(1, 2, 3).required(),
    pointsPerSession: Joi.number().min(1).required(),
    equipment:        Joi.array().items(Joi.string()).optional(),
    description:      Joi.string().max(1000).optional()
  });
  return schema.validate(gym);
}

module.exports = { Gym, gymSchema, openingHoursSchema, validateGym };
