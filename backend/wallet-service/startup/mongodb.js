const mongoose = require('mongoose');
const winston  = require('winston');

module.exports = function initMongoDB() {
  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', (collection, method, query) => {
      winston.debug(`Mongoose → ${collection}.${method}`, JSON.stringify(query));
    });
  }
  mongoose.connection.on('disconnected', () => winston.warn('MongoDB disconnected. Reconnecting...'));
  mongoose.connection.on('reconnected',  () => winston.info('MongoDB reconnected.'));
  mongoose.connection.on('error',        (err) => winston.error('MongoDB error:', err.message));
};
