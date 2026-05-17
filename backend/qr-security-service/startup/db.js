const mongoose = require('mongoose');
const config   = require('config');
const winston  = require('winston');

const { Transaction }  = require('../models/transaction');
const { Gym }          = require('../models/gym');
const { PointsConfig } = require('../models/pointsconfig');

module.exports = async function initDB() {
  const uri = config.get('db.uri');
  await mongoose.connect(uri);
  winston.info(`Connected to MongoDB → ${uri}`);
  await Promise.all([
    Transaction.createCollection(),
    Gym.createCollection(),
    PointsConfig.createCollection()
  ]);
  winston.info('qr-security collections registered.');
};
