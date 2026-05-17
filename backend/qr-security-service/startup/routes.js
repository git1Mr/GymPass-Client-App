const express = require('express');
const error   = require('../middleware/error');
const gymAccessRoute = require('../routes/gymAccess');

module.exports = function initRoutes(app) {
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ ok: true, service: 'qr-security-service' }));
  app.use('/api/gym-access', gymAccessRoute);
  app.use(error);
};
