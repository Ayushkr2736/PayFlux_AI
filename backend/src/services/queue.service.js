// ============================================
// PayFlux AI - Queue Service
// backend/src/services/queue.service.js
// ============================================
// Business logic for offline payment queue —
// enqueue, batch sync, stats, and cancellation.

const PaymentQueue = require('../models/PaymentQueue');
const Payment = require('../models/Payment');
const razorpayService = require('./razorpay.service');
const { config } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Enqueue a batch of offline payments.
 * Handles deduplication by localId.
 * @param {string} userId
 * @param {Array} items - [{ localId, amount, currency, description, notes, createdOfflineAt }]
 * @returns {{ created, duplicates, errors }}
 */
async function enqueueBatch(userId, items) {
  const results = { created: 0, duplicates: 0, errors: [], items: [] };

  for (const item of items) {
    try {
      // Check for duplicate localId (idempotency)
      const existing = await PaymentQueue.findOne({ localId: item.localId });
      if (existing) {
        results.duplicates += 1;
        results.items.push({ localId: item.localId, status: 'duplicate', queueId: existing._id });
        continue;
      }

      const queueItem = await PaymentQueue.create({
        userId,
        localId: item.localId,
        amount: item.amount,
        currency: item.currency || 'INR',
        description: item.description || '',
        notes: item.notes || {},
        createdOfflineAt: item.createdOfflineAt || new Date(),
        maxRetries: config.queue.maxRetries,
      });

      results.created += 1;
      results.items.push({ localId: item.localId, status: 'queued', queueId: queueItem._id });
    } catch (error) {
      results.errors.push({ localId: item.localId, error: error.message });
      logger.error(`Failed to enqueue item ${item.localId}:`, error.message);
    }
  }

  return results;
}

/**
 * Process and sync queued items for a specific user.
 * Creates Razorpay orders for each queued item.
 * @param {string} userId
 * @param {number} batchSize
 * @returns {{ synced, failed, remaining, results }}
 */
async function syncUserQueue(userId, batchSize = 10) {
  // Get pending items for this user
  const items = await PaymentQueue.find({
    userId,
    status: { $in: ['queued'] },
    $expr: { $lt: ['$retryCount', '$maxRetries'] },
  })
    .sort({ priority: -1, createdAt: 1 })
    .limit(batchSize);

  const results = { synced: 0, failed: 0, remaining: 0, items: [] };

  for (const item of items) {
    try {
      // Mark as processing
      await item.markProcessing();

      // Create Razorpay order
      const razorpayOrder = await razorpayService.createOrder({
        amount: item.amount,
        currency: item.currency,
        notes: Object.fromEntries(item.notes || new Map()),
      });

      // Create Payment record in our DB
      const payment = await Payment.create({
        userId: item.userId,
        razorpayOrderId: razorpayOrder.id,
        amount: item.amount,
        currency: item.currency,
        description: item.description,
        status: 'created',
        syncedFromOffline: true,
        queueId: item._id,
        localId: item.localId,
      });

      // Mark queue item as synced
      await item.markSynced(payment._id, razorpayOrder.id);

      results.synced += 1;
      results.items.push({
        localId: item.localId,
        status: 'synced',
        razorpayOrderId: razorpayOrder.id,
        paymentId: payment._id,
      });

      logger.info(`Queue item synced: ${item.localId} → ${razorpayOrder.id}`);
    } catch (error) {
      // Mark as failed with retry backoff
      await item.markFailed(error.message, config.queue.retryDelayMs);

      results.failed += 1;
      results.items.push({
        localId: item.localId,
        status: 'failed',
        error: error.message,
        retryCount: item.retryCount,
      });

      logger.error(`Queue sync failed for ${item.localId}:`, error.message);
    }
  }

  // Count remaining items
  results.remaining = await PaymentQueue.countDocuments({
    userId,
    status: { $in: ['queued'] },
  });

  return results;
}

/**
 * Get queue statistics for a user.
 * @param {string} userId
 * @returns {object}
 */
async function getQueueStats(userId) {
  return PaymentQueue.getUserQueueStats(userId);
}

/**
 * Get paginated queue items for a user.
 * @param {string} userId
 * @param {object} options - { status, page, limit }
 * @returns {{ items, pagination }}
 */
async function getUserQueueItems(userId, { status, page = 1, limit = 20 }) {
  const filter = { userId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    PaymentQueue.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PaymentQueue.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Cancel a queued item (only if status is 'queued').
 * @param {string} userId
 * @param {string} localId
 * @returns {object|null}
 */
async function cancelItem(userId, localId) {
  const item = await PaymentQueue.findOneAndUpdate(
    { userId, localId, status: 'queued' },
    { status: 'cancelled' },
    { new: true }
  );
  return item;
}

module.exports = {
  enqueueBatch,
  syncUserQueue,
  getQueueStats,
  getUserQueueItems,
  cancelItem,
};
