import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSyncStore } from './store/sync.store';
import { useInvoiceStore } from '@/features/invoices/store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';

export const useSyncWorker = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { setOnlineStatus, processQueue, pullRemoteData } = useSyncStore();

  const syncAndHydrate = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      // 1. Pull latest documents from Firestore to local IndexedDB
      await pullRemoteData();
      
      // 2. Refresh Zustand stores so UI reflects pulled data instantly
      await Promise.all([
        useInvoiceStore.getState().loadInvoices(),
        useCustomerStore.getState().loadCustomers(),
        useSettingsStore.getState().loadSettings(),
      ]);

      // 3. Process any local pending queue items to push to Firestore
      await processQueue();
    } catch (err) {
      console.error('Failed syncAndHydrate:', err);
    }
  }, [isAuthenticated, user, pullRemoteData, processQueue]);

  const handleOnline = useCallback(() => {
    setOnlineStatus(true);
    syncAndHydrate();
  }, [setOnlineStatus, syncAndHydrate]);

  const handleOffline = useCallback(() => {
    setOnlineStatus(false);
  }, [setOnlineStatus]);

  // Handle Online / Offline events
  useEffect(() => {
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

  // Initial pull and sync on auth state ready (Technique 4: reactive sync replaces 10s polling interval)
  useEffect(() => {
    if (isAuthenticated && user) {
      syncAndHydrate();
    }
  }, [isAuthenticated, user, syncAndHydrate]);
};


