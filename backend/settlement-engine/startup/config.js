const config  = require('config');
const winston = require('winston');

module.exports = function initConfig() {
  if (!config.get('jwtPrivateKey'))
    throw new Error('FATAL: jwtPrivateKey is not set. Set JWT_PRIVATE_KEY env var.');
  if (!config.get('db.uri'))
    throw new Error('FATAL: db.uri is not set. Set MONGO_URI env var.');
  winston.info(`Config loaded. App name: ${config.get('name')}`);
};
