// ============================================
// PayFlux AI - Razorpay Client Configuration
// backend/src/config/razorpay.js
// ============================================
// Initializes the Razorpay SDK client with test credentials.

const Razorpay = require('razorpay');
const { config } = require('./env');
const logger = require('../utils/logger');

let razorpayInstance = null;

/**
 * Returns a singleton Razorpay instance.
 * Lazy-initialized so the app doesn't crash if keys are missing at boot.
 */
function getRazorpayClient() {
  if (razorpayInstance) return razorpayInstance;

  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    logger.error('Razorpay keys not configured. Cannot create client.');
    throw new Error('Razorpay credentials missing. Check .env file.');
  }

  razorpayInstance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });

  logger.info('✅ Razorpay client initialized (test mode)');
  return razorpayInstance;
}

module.exports = { getRazorpayClient };
