// ============================================
// PayFlux AI - Payment Controller
// backend/src/controllers/payment.controller.js
// ============================================
// Handles payment order creation, verification, and history.

const razorpayService = require('../services/razorpay.service');
const intelligenceService = require('../services/intelligence.service');
const Payment = require('../models/Payment');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order and stores it in our DB.
 * Body: { amount (paise), currency, description, notes }
 */
async function createOrder(req, res, next) {
  try {
    const { amount, currency, description, notes } = req.body;
    const userId = req.user.id;

    // Step 1: Run pre-payment intelligence analysis
    const preAnalysis = await intelligenceService.analyzePrePayment(userId, amount);

    // Step 2: Block if intelligence says so
    if (preAnalysis.suggestedAction === 'block') {
      logger.warn(`Payment blocked by intelligence for user ${userId}`, preAnalysis);
      return sendError(res, 403, 'Payment blocked by security analysis', {
        riskScore: preAnalysis.riskScore,
        flags: preAnalysis.flags,
      });
    }

    // Step 3: Create Razorpay order
    const razorpayOrder = await razorpayService.createOrder({
      amount,
      currency: currency || 'INR',
      notes: notes || {},
    });

    // Step 4: Save payment record in our DB
    const payment = await Payment.create({
      userId,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: currency || 'INR',
      description: description || '',
      notes: notes || {},
      receipt: razorpayOrder.receipt,
      status: 'created',
      intelligence: {
        intentCategory: preAnalysis.intentCategory,
        riskScore: preAnalysis.riskScore,
        riskLevel: preAnalysis.riskLevel,
        flags: preAnalysis.flags,
        suggestedAction: preAnalysis.suggestedAction,
        analyzedAt: new Date(),
      },
    });

    logger.info(`Order created: ${razorpayOrder.id} for user ${userId}`);
    return sendSuccess(res, 201, 'Order created successfully', {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id,
      intelligence: {
        riskLevel: preAnalysis.riskLevel,
        suggestedAction: preAnalysis.suggestedAction,
        flags: preAnalysis.flags,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature after checkout.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Step 1: Verify signature
    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      logger.warn(`Invalid payment signature for order ${razorpay_order_id}`);
      return sendError(res, 400, 'Payment verification failed. Invalid signature.');
    }

    // Step 2: Update payment record in our DB
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
      },
      { new: true }
    );

    if (!payment) {
      return sendError(res, 404, 'Payment order not found');
    }

    // Step 3: Run post-payment intelligence (update user metadata)
    await intelligenceService.processPostPayment(payment);

    logger.info(`Payment verified: ${razorpay_payment_id}`);
    return sendSuccess(res, 200, 'Payment verified successfully', { payment });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payments/history
 * Get paginated payment history for the authenticated user.
 * Query: { page, limit, status }
 */
async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Payment history fetched', {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payments/:id
 * Get a single payment by ID (must belong to the authenticated user).
 */
async function getPaymentById(req, res, next) {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    return sendSuccess(res, 200, 'Payment fetched', { payment });
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, verifyPayment, getHistory, getPaymentById };
