const mongoose = require('mongoose');
const config   = require('config');
const winston  = require('winston');

const { User }              = require('../models/user');
const { Gym }               = require('../models/gym');
const { Transaction }       = require('../models/transaction');
const { PointsConfig, seedDefaultConfig } = require('../models/pointsconfig');
const { Settlement }        = require('../models/settlement');
const { WithdrawalRequest } = require('../models/withdrawalrequest');
const { TierRequest }       = require('../models/tierrequest');

module.exports = async function initDB() {
  const uri = config.get('db.uri');
  await mongoose.connect(uri);
  winston.info(`Connected to MongoDB → ${uri}`);

  await Promise.all([
    User.createCollection(),
    Gym.createCollection(),
    Transaction.createCollection(),
    PointsConfig.createCollection(),
    Settlement.createCollection(),
    WithdrawalRequest.createCollection(),
    TierRequest.createCollection()
  ]);

  winston.info('Wallet collections registered.');
  await seedDefaultConfig();
};
