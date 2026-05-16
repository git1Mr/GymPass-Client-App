const express = require('express');
const error   = require('../middleware/error');

const authRoute  = require('../routes/auth');
const usersRoute = require('../routes/users');

module.exports = function initRoutes(app) {
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'auth-service' }));

  app.use('/api/auth',  authRoute);
  app.use('/api/users', usersRoute);

  app.use(error);
};
