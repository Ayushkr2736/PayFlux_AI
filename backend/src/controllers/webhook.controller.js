// ============================================
// PayFlux AI - Webhook Controller
// backend/src/controllers/webhook.controller.js
// ============================================
// Processes incoming Razorpay webhook events.
// Webhook route receives raw body (not JSON parsed)
// for signature verification.

const { config } = require('../config/env');
const { verifyWebhookSignature } = require('../utils/crypto');
const Payment = require('../models/Payment');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/webhooks/razorpay
 * Handles Razorpay webhook events:
 * - payment.authorized
 * - payment.captured
 * - payment.failed
 * - order.paid
 */
async function handleRazorpayWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body; // Raw buffer (express.raw middleware in server.js)

    // Step 1: Verify webhook signature
    if (!signature || !config.razorpay.webhookSecret) {
      logger.warn('Webhook received without signature or secret not configured');
      return sendError(res, 400, 'Webhook signature missing');
    }

    const isValid = verifyWebhookSignature(
      rawBody,
      signature,
      config.razorpay.webhookSecret
    );

    if (!isValid) {
      logger.warn('Invalid webhook signature received');
      return sendError(res, 400, 'Invalid webhook signature');
    }

    // Step 2: Parse the verified payload
    const event = JSON.parse(rawBody.toString());
    const eventType = event.event;
    const payload = event.payload;

    logger.info(`Webhook received: ${eventType}`, { eventId: event.id });

    // Step 3: Handle specific event types
    switch (eventType) {
      case 'payment.authorized': {
        const paymentEntity = payload.payment.entity;
        await Payment.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          {
            razorpayPaymentId: paymentEntity.id,
            status: 'authorized',
            method: paymentEntity.method,
          }
        );
        logger.info(`Payment authorized: ${paymentEntity.id}`);
        break;
      }

      case 'payment.captured': {
        const paymentEntity = payload.payment.entity;
        await Payment.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          {
            razorpayPaymentId: paymentEntity.id,
            status: 'captured',
            method: paymentEntity.method,
          }
        );
        logger.info(`Payment captured: ${paymentEntity.id}`);
        break;
      }

      case 'payment.failed': {
        const paymentEntity = payload.payment.entity;
        await Payment.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          {
            razorpayPaymentId: paymentEntity.id,
            status: 'failed',
            method: paymentEntity.method,
            failureReason: paymentEntity.error_description || 'Payment failed',
          }
        );
        logger.warn(`Payment failed: ${paymentEntity.id}`);
        break;
      }

      case 'order.paid': {
        const orderEntity = payload.order.entity;
        await Payment.findOneAndUpdate(
          { razorpayOrderId: orderEntity.id },
          { status: 'captured' }
        );
        logger.info(`Order paid: ${orderEntity.id}`);
        break;
      }

      default:
        logger.info(`Unhandled webhook event: ${eventType}`);
    }

    // Always respond 200 to Razorpay (they retry on non-2xx)
    return sendSuccess(res, 200, 'Webhook processed');
  } catch (error) {
    // Still respond 200 to prevent Razorpay retries on our internal errors
    logger.error('Webhook processing error:', error);
    return sendSuccess(res, 200, 'Webhook received');
  }
}

module.exports = { handleRazorpayWebhook };
