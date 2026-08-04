/**
 * Ledgerly — Network Status Hook
 * Location: src/core/pwa/useNetworkStatus.ts
 *
 * Centralized browser online/offline event listener.
 * Single source of truth for network state across the app.
 *
 * Replaces the inline window event listeners in useSyncWorker.ts,
 * eliminating duplicated event listener logic.
 *
 * Usage:
 *   const { isOnline } = useNetworkStatus();
 */

import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
