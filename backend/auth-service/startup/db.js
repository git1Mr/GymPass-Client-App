const mongoose = require('mongoose');
const config   = require('config');
const winston  = require('winston');

const { User } = require('../models/user');

module.exports = async function initDB() {
  const uri = config.get('db.uri');
  await mongoose.connect(uri);
  winston.info(`Connected to MongoDB → ${uri}`);
  await User.createCollection();
  winston.info('users collection registered.');
};
