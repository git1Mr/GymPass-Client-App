const mongoose = require('mongoose');
const Joi      = require('joi');
const jwt      = require('jsonwebtoken');
const config   = require('config');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 5, maxlength: 255 },
  password: { type: String, required: true, minlength: 8 },
  role:     { type: String, enum: ['member', 'gym_staff', 'admin'], default: 'member' },
  deviceId: { type: String, required: true, unique: true },
  gymId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', default: null },
  pointsBalance: { type: Number, default: 0, min: 0 },
  status:   { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' }
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
    role:     Joi.string().valid('member', 'gym_staff', 'admin').default('member'),
    gymId:    Joi.string().optional()
  });
  return schema.validate(user);
}

module.exports = { User, userSchema, validateUser };
