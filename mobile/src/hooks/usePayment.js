// ============================================
// PayFlux AI - usePayment Hook
// mobile/src/hooks/usePayment.js
// ============================================

import { useContext } from 'react';
import { PaymentContext } from '../store/PaymentContext';

/**
 * Convenience hook to consume PaymentContext.
 * @returns {{ payments, currentOrder, isLoading, pagination, createNewOrder, verifyCurrentPayment, fetchHistory }}
 */
export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
