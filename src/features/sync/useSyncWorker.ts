import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSyncStore } from './store/sync.store';

export const useSyncWorker = () => {
  const { isAuthenticated } = useAuthStore();
  const { isOnline, setOnlineStatus, processQueue, isSyncing } = useSyncStore();

  const handleOnline = useCallback(() => {
    setOnlineStatus(true);
    if (isAuthenticated && !isSyncing) {
      processQueue();
    }
  }, [isAuthenticated, isSyncing, processQueue, setOnlineStatus]);

  const handleOffline = useCallback(() => {
    setOnlineStatus(false);
  }, [setOnlineStatus]);

  useEffect(() => {
    // Initial check
    if (navigator.onLine) {
      handleOnline();
    } else {
      handleOffline();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Periodic polling to flush the queue just in case new items were added while online
  useEffect(() => {
    if (!isAuthenticated || !isOnline) return;

    const interval = setInterval(() => {
      if (!useSyncStore.getState().isSyncing) {
        processQueue();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, isOnline, processQueue]);
};
