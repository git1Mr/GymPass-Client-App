require('dotenv').config();
const express = require('express');
const winston = require('winston');
const config  = require('config');

const initLogging = require('./startup/logging');
const initConfig  = require('./startup/config');
const initMongoDB = require('./startup/mongodb');
const initDB     = require('./startup/db');
const initRoutes = require('./startup/routes');

const app = express();

async function start() {
  initLogging();
  initConfig();
  initMongoDB();
  await initDB();
  initRoutes(app);

  const port = config.get('port') || 3004;
  app.listen(port, '0.0.0.0', () => {
    winston.info(`settlement-engine listening on ${port}`);
    console.log(`settlement-engine listening on ${port}`);
  });
}

start().catch((err) => {
  console.error('FATAL STARTUP ERROR:', err);
  winston.error('Failed to start settlement-engine', { message: err.message, stack: err.stack });
  process.exit(1);
});

module.exports = app;
