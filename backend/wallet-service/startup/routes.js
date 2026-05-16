const express = require('express');
const error   = require('../middleware/error');

const gymsRoute         = require('../routes/gym');
const transactionsRoute = require('../routes/transactions');
const pointsConfigRoute = require('../routes/pointsconfig');
const settlementsRoute  = require('../routes/settlements');
const withdrawalsRoute  = require('../routes/withdrawalrequests');
const tierRequestsRoute = require('../routes/tierrequests');
const gymAccessRoute    = require('../routes/gymAccess');
const paymentsRoute     = require('../routes/payments');

module.exports = function initRoutes(app) {
  // Stripe webhook must receive the raw body so signature verification works.
  const rawJson  = express.raw({ type: 'application/json' });
  const jsonBody = express.json();
  app.use((req, res, next) => {
    if (req.path === '/api/payments/webhook') return rawJson(req, res, next);
    return jsonBody(req, res, next);
  });

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'wallet-service' }));

  app.use('/api/gyms',          gymsRoute);
  app.use('/api/transactions',  transactionsRoute);
  app.use('/api/points-config', pointsConfigRoute);
  app.use('/api/settlements',   settlementsRoute);
  app.use('/api/withdrawals',   withdrawalsRoute);
  app.use('/api/tier-requests', tierRequestsRoute);
  app.use('/api/gym-access',    gymAccessRoute);
  app.use('/api/payments',      paymentsRoute);

  app.use(error);
};
