const winston = require('winston');

module.exports = function error(err, _req, res, _next) {
  winston.error(err.message, err);
  res.status(500).send('Server error: ' + err.message);
};
