// ============================================
// PayFlux AI - Payment Context
// mobile/src/store/PaymentContext.js
// ============================================
// Manages payment state — history, current order.

import React, { createContext, useState } from 'react';
import { createOrder, verifyPayment, getPaymentHistory } from '../services/payment.api';

export const PaymentContext = createContext(null);

export function PaymentProvider({ children }) {
  const [payments, setPayments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  async function createNewOrder(orderData) {
    setIsLoading(true);
    try {
      const response = await createOrder(orderData);
      setCurrentOrder(response.data);
      return response;
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCurrentPayment(verificationData) {
    setIsLoading(true);
    try {
      const response = await verifyPayment(verificationData);
      setCurrentOrder(null); // Clear after verification
      // Refresh history to include the new payment
      await fetchHistory();
      return response;
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchHistory(page = 1, limit = 20, status = null) {
    setIsLoading(true);
    try {
      const params = { page, limit };
      if (status) params.status = status;

      const response = await getPaymentHistory(params);
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
      return response;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PaymentContext.Provider
      value={{
        payments,
        currentOrder,
        isLoading,
        pagination,
        createNewOrder,
        verifyCurrentPayment,
        fetchHistory,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}
