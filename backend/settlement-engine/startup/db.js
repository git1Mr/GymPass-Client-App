const mongoose = require('mongoose');
const config   = require('config');
const winston  = require('winston');

const { Settlement }   = require('../models/settlement');
const { Transaction }  = require('../models/transaction');
const { PointsConfig } = require('../models/pointsconfig');
const { Gym }          = require('../models/gym');

module.exports = async function initDB() {
  const uri = config.get('db.uri');
  await mongoose.connect(uri);
  winston.info(`Connected to MongoDB → ${uri}`);
  await Promise.all([
    Settlement.createCollection(),
    Transaction.createCollection(),
    PointsConfig.createCollection(),
    Gym.createCollection()
  ]);
  winston.info('settlement-engine collections registered.');
};
