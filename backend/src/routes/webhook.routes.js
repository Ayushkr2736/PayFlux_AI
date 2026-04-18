// ============================================
// PayFlux AI - Webhook Routes
// backend/src/routes/webhook.routes.js
// ============================================
// POST /api/webhooks/razorpay — Razorpay webhook receiver
// NOTE: This route receives raw body (not JSON) for HMAC verification.
//       The raw body middleware is mounted in server.js BEFORE json().

const express = require('express');
const { handleRazorpayWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

router.post('/razorpay', handleRazorpayWebhook);

module.exports = router;
