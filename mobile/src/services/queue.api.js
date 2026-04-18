// ============================================
// PayFlux AI - Queue API Client
// mobile/src/services/queue.api.js
// ============================================
// API calls for offline queue sync endpoints.

import api from './api.service';

/**
 * Enqueue a batch of offline payments to the server.
 * @param {Array} items - [{ localId, amount, currency, description, createdOfflineAt }]
 * @returns {{ created, duplicates, errors, items }}
 */
export async function enqueuePayments(items) {
  return api.post('/queue/enqueue', { items });
}

/**
 * Trigger server-side queue sync.
 * @param {number} batchSize
 * @returns {{ synced, failed, remaining, items }}
 */
export async function syncQueue(batchSize = 10) {
  return api.post(`/queue/sync?batchSize=${batchSize}`);
}

/**
 * Get queue statistics.
 * @returns {{ stats }}
 */
export async function getQueueStatus() {
  return api.get('/queue/status');
}

/**
 * Get queue items with optional filter.
 * @param {{ status?, page?, limit? }} params
 * @returns {{ items, pagination }}
 */
export async function getQueueItems(params = {}) {
  return api.get('/queue/items', { params });
}

/**
 * Cancel a queued item.
 * @param {string} localId
 * @returns {{ item }}
 */
export async function cancelQueueItem(localId) {
  return api.delete(`/queue/${localId}`);
}
