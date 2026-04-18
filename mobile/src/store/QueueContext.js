// ============================================
// PayFlux AI - Queue Context
// mobile/src/store/QueueContext.js
// ============================================
// Manages offline queue state — local items,
// sync status, and pending count.

import React, { createContext, useState, useEffect } from 'react';
import * as offlineQueue from '../services/offline.queue';
import { startSyncListener, stopSyncListener, performSync } from '../services/sync.manager';

export const QueueContext = createContext(null);

export function QueueProvider({ children }) {
  const [queueItems, setQueueItems] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Load queue from storage and start sync listener on mount
  useEffect(() => {
    loadQueue();
    startSyncListener(handleSyncResult);

    return () => {
      stopSyncListener();
    };
  }, []);

  async function loadQueue() {
    const items = await offlineQueue.getQueueItems();
    setQueueItems(items);
    setPendingCount(items.filter((i) => i.status === 'queued').length);
  }

  async function addPaymentToQueue(paymentData) {
    const newItem = await offlineQueue.addToQueue(paymentData);
    await loadQueue(); // Refresh state
    return newItem;
  }

  async function triggerSync() {
    setIsSyncing(true);
    try {
      const result = await performSync();
      await loadQueue(); // Refresh after sync
      return result;
    } finally {
      setIsSyncing(false);
    }
  }

  function handleSyncResult(result) {
    setLastSyncResult(result);
    loadQueue(); // Refresh after auto-sync
  }

  return (
    <QueueContext.Provider
      value={{
        queueItems,
        pendingCount,
        isSyncing,
        lastSyncResult,
        addPaymentToQueue,
        triggerSync,
        loadQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}
