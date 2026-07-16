import { create } from 'zustand';
import { SyncQueueRepository } from '@/core/storage/syncQueue.repository';
import { CloudSyncService } from '@/core/sync/cloudSync.service';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingItemsCount: number;

  setOnlineStatus: (status: boolean) => void;
  processQueue: () => Promise<void>;
  checkPendingCount: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  pendingItemsCount: 0,

  setOnlineStatus: (status) => set({ isOnline: status }),

  checkPendingCount: async () => {
    try {
      const pending = await SyncQueueRepository.getPending();
      set({ pendingItemsCount: pending.length });
    } catch (e) {
      console.error('Failed to check sync queue count', e);
    }
  },

  processQueue: async () => {
    const { isOnline, isSyncing } = get();
    const { isAuthenticated } = useAuthStore.getState();

    if (!isOnline || isSyncing || !isAuthenticated) return;

    set({ isSyncing: true });

    try {
      const pendingItems = await SyncQueueRepository.getPending();
      set({ pendingItemsCount: pendingItems.length });

      if (pendingItems.length === 0) {
        set({ isSyncing: false });
        return;
      }

      for (const item of pendingItems) {
        try {
          await CloudSyncService.pushOperation(item);
          await SyncQueueRepository.remove(item.id);
        } catch (error) {
          console.error(`Sync failed for item ${item.id}`, error);
          await SyncQueueRepository.markError(item.id);
          // If it's a critical auth error, maybe break. Otherwise, continue to next.
        }
      }

      const remaining = await SyncQueueRepository.getPending();
      set({ 
        isSyncing: false, 
        lastSyncTime: Date.now(),
        pendingItemsCount: remaining.length 
      });

    } catch (error) {
      console.error('Queue processing failed entirely', error);
      set({ isSyncing: false });
    }
  },
}));
