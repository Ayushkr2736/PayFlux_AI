// backend/src/services/paymentService.js
const { getRazorpayClient } = require('../config/razorpay');
const { config } = require('../config/env');
const crypto = require('crypto');

const createOrder = async (amount, currency = 'INR', notes = {}) => {
  const razorpay = getRazorpayClient();
  const options = {
    amount,
    currency,
    receipt: `rcpt_${Date.now()}`,
    notes,
  };
  return await razorpay.orders.create(options);
};

const verifySignature = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
};

module.exports = { createOrder, verifySignature };
