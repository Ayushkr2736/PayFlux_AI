// ============================================
// PayFlux AI - useNetworkStatus Hook
// mobile/src/hooks/useNetworkStatus.js
// ============================================
// Tracks real-time network connectivity state.

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook that returns current network status.
 * Re-renders component when connectivity changes.
 *
 * @returns {{ isConnected: boolean, isInternetReachable: boolean }}
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkStatus;
}
