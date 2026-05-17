const winston = require('winston');

module.exports = function initLogging() {
  winston.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple()
    )
  }));
  winston.exceptions.handle(
    new winston.transports.Console({ format: winston.format.simple() })
  );
  process.on('unhandledRejection', (reason) => { throw reason; });
  winston.info('Logging initialized.');
};
