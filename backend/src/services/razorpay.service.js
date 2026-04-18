// ============================================
// PayFlux AI - Razorpay Service
// backend/src/services/razorpay.service.js
// ============================================
// Wraps Razorpay SDK operations — order creation,
// payment fetch, signature verification, refunds.

const { getRazorpayClient } = require('../config/razorpay');
const { config } = require('../config/env');
const { verifyRazorpaySignature } = require('../utils/crypto');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Create a Razorpay order.
 * @param {object} options - { amount (paise), currency, notes }
 * @returns {object} Razorpay order object
 */
async function createOrder({ amount, currency = 'INR', notes = {} }) {
  const razorpay = getRazorpayClient();

  const order = await razorpay.orders.create({
    amount,           // Amount in smallest currency unit (paise for INR)
    currency,
    receipt: `rcpt_${uuidv4().slice(0, 8)}`, // Short unique receipt ID
    notes,
    payment_capture: 1, // Auto-capture payments (no manual capture needed)
  });

  logger.info(`Razorpay order created: ${order.id}, amount: ₹${amount / 100}`);
  return order;
}

/**
 * Fetch a Razorpay order by ID.
 * @param {string} orderId
 * @returns {object}
 */
async function fetchOrder(orderId) {
  const razorpay = getRazorpayClient();
  return razorpay.orders.fetch(orderId);
}

/**
 * Fetch a Razorpay payment by ID.
 * @param {string} paymentId
 * @returns {object}
 */
async function fetchPayment(paymentId) {
  const razorpay = getRazorpayClient();
  return razorpay.payments.fetch(paymentId);
}

/**
 * Verify the payment signature returned by Razorpay checkout.
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 * @returns {boolean}
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
  return verifyRazorpaySignature(
    orderId,
    paymentId,
    signature,
    config.razorpay.keySecret
  );
}

/**
 * Initiate a refund for a captured payment.
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in paise (partial or full)
 * @returns {object} Razorpay refund object
 */
async function createRefund(paymentId, amount) {
  const razorpay = getRazorpayClient();

  const refund = await razorpay.payments.refund(paymentId, {
    amount,
    speed: 'normal',
  });

  logger.info(`Refund initiated: ${refund.id} for payment ${paymentId}`);
  return refund;
}

module.exports = {
  createOrder,
  fetchOrder,
  fetchPayment,
  verifyPaymentSignature,
  createRefund,
};
