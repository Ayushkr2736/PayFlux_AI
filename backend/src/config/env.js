// ============================================
// PayFlux AI - Environment Configuration Loader
// backend/src/config/env.js
// ============================================
// Centralizes all env vars with defaults & validation.
// Import this everywhere instead of reading process.env directly.

const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // -- Server --
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // -- MongoDB --
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/payflux_ai',

  // -- JWT --
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_not_for_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // -- Razorpay --
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  // -- Queue --
  queue: {
    maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES, 10) || 5,
    retryDelayMs: parseInt(process.env.QUEUE_RETRY_DELAY_MS, 10) || 3000,
  },
};

/**
 * Validates that required env vars are present.
 * Call once at server startup.
 */
function validateEnv() {
  const required = ['MONGODB_URI'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missing.join(', ')}. Using defaults.`
    );
  }

  // Warn about Razorpay keys (not fatal — we can still run the queue system)
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    console.warn(
      '⚠️  Razorpay keys not configured. Payment processing will fail until set.'
    );
  }
}

module.exports = { config, validateEnv };
