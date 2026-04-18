// ============================================
// PayFlux AI - Queue Routes
// backend/src/routes/queue.routes.js
// ============================================
// POST   /api/queue/enqueue    — Add offline payments to queue
// POST   /api/queue/sync       — Trigger queue sync
// GET    /api/queue/status     — Queue statistics
// GET    /api/queue/items      — List queue items
// DELETE /api/queue/:localId   — Cancel a queued item

const express = require('express');
const {
  enqueue,
  syncQueue,
  getQueueStatus,
  getQueueItems,
  cancelQueueItem,
} = require('../controllers/queue.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All queue routes require authentication
router.use(authenticate);

router.post('/enqueue', enqueue);
router.post('/sync', syncQueue);
router.get('/status', getQueueStatus);
router.get('/items', getQueueItems);
router.delete('/:localId', cancelQueueItem);

module.exports = router;
