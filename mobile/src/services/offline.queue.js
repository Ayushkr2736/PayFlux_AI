// ============================================
// PayFlux AI - Offline Payment Queue
// mobile/src/services/offline.queue.js
// ============================================
// AsyncStorage-based queue for payments created while offline.
// Payments are stored locally and synced when connectivity returns.

import { v4 as uuidv4 } from 'uuid';
import { getItem, setItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Get all items currently in the offline queue.
 * @returns {Array}
 */
export async function getQueueItems() {
  const items = await getItem(STORAGE_KEYS.OFFLINE_QUEUE);
  return items || [];
}

/**
 * Add a payment to the offline queue.
 * Generates a unique localId for deduplication on sync.
 *
 * @param {{ amount, currency, description, notes }} paymentData
 * @returns {object} The queued item with localId
 */
export async function addToQueue(paymentData) {
  const items = await getQueueItems();

  const queueItem = {
    localId: uuidv4(),
    amount: paymentData.amount,
    currency: paymentData.currency || 'INR',
    description: paymentData.description || '',
    notes: paymentData.notes || {},
    status: 'queued',        // Local status
    createdOfflineAt: new Date().toISOString(),
    retryCount: 0,
  };

  items.push(queueItem);
  await setItem(STORAGE_KEYS.OFFLINE_QUEUE, items);

  return queueItem;
}

/**
 * Remove synced items from the offline queue.
 * Called after successful server sync.
 * @param {Array<string>} localIds - IDs of items that were synced
 */
export async function removeSyncedItems(localIds) {
  const items = await getQueueItems();
  const remaining = items.filter((item) => !localIds.includes(item.localId));
  await setItem(STORAGE_KEYS.OFFLINE_QUEUE, remaining);
  return remaining;
}

/**
 * Update the status of a queue item locally.
 * @param {string} localId
 * @param {string} newStatus
 */
export async function updateItemStatus(localId, newStatus) {
  const items = await getQueueItems();
  const updated = items.map((item) =>
    item.localId === localId ? { ...item, status: newStatus } : item
  );
  await setItem(STORAGE_KEYS.OFFLINE_QUEUE, updated);
}

/**
 * Get count of pending (un-synced) items.
 * @returns {number}
 */
export async function getPendingCount() {
  const items = await getQueueItems();
  return items.filter((item) => item.status === 'queued').length;
}

/**
 * Clear the entire offline queue.
 */
export async function clearQueue() {
  await setItem(STORAGE_KEYS.OFFLINE_QUEUE, []);
}
