// ============================================
// PayFlux AI - Queue Controller
// backend/src/controllers/queue.controller.js
// ============================================
// Handles offline payment queue — enqueue from mobile,
// sync to Razorpay, get queue status.

const queueService = require('../services/queue.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/queue/enqueue
 * Add one or more payments to the offline queue.
 * Body: { items: [{ localId, amount, currency, description, notes, createdOfflineAt }] }
 */
async function enqueue(req, res, next) {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 400, 'items array is required and must not be empty');
    }

    // Cap batch size to prevent abuse
    if (items.length > 50) {
      return sendError(res, 400, 'Maximum 50 items per batch');
    }

    const result = await queueService.enqueueBatch(userId, items);

    logger.info(`Enqueued ${result.created} items for user ${userId}`);
    return sendSuccess(res, 201, 'Items queued successfully', result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/queue/sync
 * Trigger sync for all queued items belonging to the user.
 * Processes the next batch and returns results.
 */
async function syncQueue(req, res, next) {
  try {
    const userId = req.user.id;
    const batchSize = Math.min(parseInt(req.query.batchSize, 10) || 10, 25);

    const result = await queueService.syncUserQueue(userId, batchSize);

    logger.info(
      `Sync completed for user ${userId}: ${result.synced} synced, ${result.failed} failed`
    );
    return sendSuccess(res, 200, 'Queue sync completed', result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/queue/status
 * Get queue statistics for the authenticated user.
 */
async function getQueueStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const stats = await queueService.getQueueStats(userId);

    return sendSuccess(res, 200, 'Queue status fetched', { stats });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/queue/items
 * Get all queue items for the user with optional status filter.
 * Query: { status, page, limit }
 */
async function getQueueItems(req, res, next) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const status = req.query.status || null;

    const result = await queueService.getUserQueueItems(userId, { status, page, limit });

    return sendSuccess(res, 200, 'Queue items fetched', result);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/queue/:localId
 * Cancel a queued item (only if still in 'queued' status).
 */
async function cancelQueueItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { localId } = req.params;

    const result = await queueService.cancelItem(userId, localId);

    if (!result) {
      return sendError(res, 404, 'Queue item not found or cannot be cancelled');
    }

    return sendSuccess(res, 200, 'Queue item cancelled', { item: result });
  } catch (error) {
    next(error);
  }
}

module.exports = { enqueue, syncQueue, getQueueStatus, getQueueItems, cancelQueueItem };
