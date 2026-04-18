// ============================================
// PayFlux AI - useAuth Hook
// mobile/src/hooks/useAuth.js
// ============================================

import { useContext } from 'react';
import { AuthContext } from '../store/AuthContext';

/**
 * Convenience hook to consume AuthContext.
 * @returns {{ user, token, isLoading, isAuthenticated, login, register, logout, refreshProfile }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
