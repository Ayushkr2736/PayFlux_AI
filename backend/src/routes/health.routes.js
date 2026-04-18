// ============================================
// PayFlux AI - Health Check & Base Routes
// backend/src/routes/health.routes.js
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/health
 * System health check — returns server + DB status.
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return sendSuccess(res, 200, 'PayFlux AI is running', {
    server: 'healthy',
    database: dbStatus[dbState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

module.exports = router;
