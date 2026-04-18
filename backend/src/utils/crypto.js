// ============================================
// PayFlux AI - Crypto Utilities
// backend/src/utils/crypto.js
// ============================================
// Helpers for hashing, HMAC verification (Razorpay webhooks), etc.

const crypto = require('crypto');

/**
 * Verify Razorpay payment signature.
 * Used after checkout to confirm payment authenticity.
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Signature from Razorpay checkout response
 * @param {string} secret - Razorpay key secret
 * @returns {boolean}
 */
function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Verify Razorpay webhook signature.
 * Used to validate incoming webhook payloads.
 * @param {string|Buffer} body - Raw request body
 * @param {string} signature - X-Razorpay-Signature header
 * @param {string} secret - Webhook secret from Razorpay dashboard
 * @returns {boolean}
 */
function verifyWebhookSignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Generate a unique idempotency key for queue operations.
 * @returns {string}
 */
function generateIdempotencyKey() {
  return crypto.randomUUID();
}

module.exports = {
  verifyRazorpaySignature,
  verifyWebhookSignature,
  generateIdempotencyKey,
};
