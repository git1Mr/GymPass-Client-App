// Slim User reference for the wallet service. Auth-service owns the canonical
// User collection; this schema only declares the fields wallet actually reads
// or writes (pointsBalance updates, Stripe customer lookup by email/name).
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:          { type: String,  required: true, trim: true },
  email:         { type: String,  required: true, unique: true, trim: true, lowercase: true },
  role:          { type: String,  enum: ['member', 'gym_staff', 'admin'], default: 'member' },
  gymId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', default: null },
  pointsBalance: { type: Number,  default: 0, min: 0 },
  status:        { type: String,  enum: ['active', 'suspended', 'pending'], default: 'active' }
}, { timestamps: true, strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = { User, userSchema };
