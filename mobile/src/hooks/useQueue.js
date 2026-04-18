// ============================================
// PayFlux AI - useQueue Hook
// mobile/src/hooks/useQueue.js
// ============================================

import { useContext } from 'react';
import { QueueContext } from '../store/QueueContext';

/**
 * Convenience hook to consume QueueContext.
 * @returns {{ queueItems, pendingCount, isSyncing, lastSyncResult, addPaymentToQueue, triggerSync, loadQueue }}
 */
export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
