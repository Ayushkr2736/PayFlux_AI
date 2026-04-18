// ============================================
// PayFlux AI - Sync Manager
// mobile/src/services/sync.manager.js
// ============================================
// Monitors network connectivity and auto-syncs
// the offline queue when the device comes back online.

import NetInfo from '@react-native-community/netinfo';
import { getQueueItems, removeSyncedItems } from './offline.queue';
import { enqueuePayments, syncQueue } from './queue.api';

let unsubscribe = null;
let isSyncing = false;
let onSyncCallback = null;

/**
 * Start listening for network changes.
 * When connectivity is restored, auto-syncs the offline queue.
 * @param {Function} callback - Called with sync results: { synced, failed }
 */
export function startSyncListener(callback) {
  onSyncCallback = callback;

  unsubscribe = NetInfo.addEventListener(async (state) => {
    if (state.isConnected && state.isInternetReachable && !isSyncing) {
      await performSync();
    }
  });
}

/**
 * Stop the network listener.
 */
export function stopSyncListener() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

/**
 * Manually trigger a sync attempt.
 * @returns {{ synced, failed, total }}
 */
export async function performSync() {
  if (isSyncing) return { synced: 0, failed: 0, total: 0 };

  isSyncing = true;

  try {
    // Step 1: Get local queue items
    const localItems = await getQueueItems();
    const pendingItems = localItems.filter((item) => item.status === 'queued');

    if (pendingItems.length === 0) {
      isSyncing = false;
      return { synced: 0, failed: 0, total: 0 };
    }

    // Step 2: Send to server queue
    const enqueueResult = await enqueuePayments(pendingItems);

    // Step 3: Trigger server-side sync (creates Razorpay orders)
    const syncResult = await syncQueue(pendingItems.length);

    // Step 4: Remove synced items from local storage
    const syncedIds = syncResult.data?.items
      ?.filter((item) => item.status === 'synced')
      ?.map((item) => item.localId) || [];

    if (syncedIds.length > 0) {
      await removeSyncedItems(syncedIds);
    }

    const result = {
      synced: syncResult.data?.synced || 0,
      failed: syncResult.data?.failed || 0,
      total: pendingItems.length,
    };

    // Notify callback
    if (onSyncCallback) {
      onSyncCallback(result);
    }

    isSyncing = false;
    return result;
  } catch (error) {
    console.error('Sync failed:', error.message);
    isSyncing = false;

    const result = { synced: 0, failed: 0, total: 0, error: error.message };
    if (onSyncCallback) {
      onSyncCallback(result);
    }
    return result;
  }
}

/**
 * Check current network status.
 * @returns {{ isConnected, isInternetReachable }}
 */
export async function getNetworkStatus() {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected,
    isInternetReachable: state.isInternetReachable,
  };
}
