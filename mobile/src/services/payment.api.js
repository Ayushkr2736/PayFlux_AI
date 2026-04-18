// ============================================
// PayFlux AI - Payment API Client
// mobile/src/services/payment.api.js
// ============================================
// API calls for payment endpoints.

import api from './api.service';

/**
 * Create a Razorpay order.
 * @param {{ amount, currency?, description?, notes? }} data
 * @returns {{ orderId, amount, currency, paymentId, intelligence }}
 */
export async function createOrder(data) {
  return api.post('/payments/create-order', data);
}

/**
 * Verify Razorpay payment after checkout.
 * @param {{ razorpay_order_id, razorpay_payment_id, razorpay_signature }} data
 * @returns {{ payment }}
 */
export async function verifyPayment(data) {
  return api.post('/payments/verify', data);
}

/**
 * Get payment history with pagination.
 * @param {{ page?, limit?, status? }} params
 * @returns {{ payments, pagination }}
 */
export async function getPaymentHistory(params = {}) {
  return api.get('/payments/history', { params });
}

/**
 * Get single payment details.
 * @param {string} paymentId
 * @returns {{ payment }}
 */
export async function getPaymentById(paymentId) {
  return api.get(`/payments/${paymentId}`);
}
