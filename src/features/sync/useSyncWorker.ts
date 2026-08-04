import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSyncStore } from './store/sync.store';
import { useInvoiceStore } from '@/features/invoices/store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useNetworkStatus } from '@/core/pwa/useNetworkStatus';

export const useSyncWorker = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { setOnlineStatus, processQueue, pullRemoteData } = useSyncStore();
  // Centralized network status from core/pwa — single source of truth
  const { isOnline } = useNetworkStatus();

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

  // Sync online status to the Zustand sync store and trigger hydration
  useEffect(() => {
    setOnlineStatus(isOnline);
    if (isOnline) {
      syncAndHydrate();
    }
  }, [isOnline, setOnlineStatus, syncAndHydrate]);

  // Initial pull and sync on auth state ready (reactive sync replaces polling)
  useEffect(() => {
    if (isAuthenticated && user) {
      syncAndHydrate();
    }
  }, [isAuthenticated, user, syncAndHydrate]);
};
