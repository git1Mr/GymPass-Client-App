const express = require('express');
const error   = require('../middleware/error');
const settlementsRoute = require('../routes/settlements');

module.exports = function initRoutes(app) {
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ ok: true, service: 'settlement-engine' }));
  app.use('/api/settlements', settlementsRoute);
  app.use(error);
};
