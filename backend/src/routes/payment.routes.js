// ============================================
// PayFlux AI - Payment Routes
// backend/src/routes/payment.routes.js
// ============================================
// POST /api/payments/create-order — Create Razorpay order
// POST /api/payments/verify       — Verify payment signature
// GET  /api/payments/history      — Paginated payment history
// GET  /api/payments/:id          — Single payment details

const express = require('express');
const {
  createOrder,
  verifyPayment,
  getHistory,
  getPaymentById,
} = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

router.post(
  '/create-order',
  validate({
    amount: { required: true, type: 'number', min: 100 },
    currency: { type: 'string', enum: ['INR', 'USD', 'EUR'] },
  }),
  createOrder
);

router.post(
  '/verify',
  validate({
    razorpay_order_id: { required: true, type: 'string' },
    razorpay_payment_id: { required: true, type: 'string' },
    razorpay_signature: { required: true, type: 'string' },
  }),
  verifyPayment
);

router.get('/history', getHistory);
router.get('/:id', getPaymentById);

module.exports = router;
