const mongoose = require('mongoose');
const Joi      = require('joi');
const jwt      = require('jsonwebtoken');
const config   = require('config');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 5, maxlength: 255 },
  password: { type: String, required: true, minlength: 8 },
  role:     { type: String, enum: ['member', 'gym_staff', 'gym_admin', 'admin'], default: 'member' },
  deviceId: { type: String, required: true, unique: true },
  gymId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', default: null },
  // Optional contact number — used by the reception Terminal's manual check-in
  // search (look up a member by email or phone).
  phone:    { type: String, trim: true, default: null },
  pointsBalance: { type: Number, default: 0, min: 0 },
  status:   { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  // Password reset — set by /api/auth/forgot-password, consumed by /reset-password.
  // Hashed (sha256) at rest so a DB leak doesn't grant immediate password resets.
  resetTokenHash:    { type: String, default: null },
  resetTokenExpires: { type: Date,   default: null }
}, { timestamps: true });

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id:     this._id,
      role:    this.role,
      gymId:   this.gymId ?? null,
      isAdmin: this.role === 'admin'
    },
    config.get('jwtPrivateKey'),
    { expiresIn: '2d' }
  );
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name:     Joi.string().min(2).max(100).required(),
    email:    Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(8).max(1024).required(),
    deviceId: Joi.string().required(),
    role:     Joi.string().valid('member', 'gym_staff', 'gym_admin', 'admin').default('member'),
    gymId:    Joi.string().optional(),
    phone:    Joi.string().max(40).optional()
  });
  return schema.validate(user);
}

module.exports = { User, userSchema, validateUser };
