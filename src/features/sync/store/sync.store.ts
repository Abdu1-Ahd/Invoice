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
  pullRemoteData: () => Promise<void>;
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
    const { isAuthenticated, user } = useAuthStore.getState();

    if (!isOnline || isSyncing || !isAuthenticated || !user) return;

    set({ isSyncing: true });

    try {
      const pendingItems = await SyncQueueRepository.getPending();
      set({ pendingItemsCount: pendingItems.length });

      if (pendingItems.length === 0) {
        return;
      }

      try {
        // Technique 3: Batched atomic sync via Firestore writeBatch
        const successIds = await CloudSyncService.pushBatch(pendingItems);
        await SyncQueueRepository.removeMany(successIds);
      } catch (batchError) {
        console.warn('Batched sync failed, falling back to individual item processing:', batchError);
        // Fallback to item-by-item if a batch commit fails so valid items succeed and errors are marked
        for (const item of pendingItems) {
          try {
            await CloudSyncService.pushOperation(item);
            await SyncQueueRepository.remove(item.id);
          } catch (error) {
            console.error(`Sync failed for item ${item.id}`, error);
            await SyncQueueRepository.markError(item.id);
          }
        }
      }

      const remaining = await SyncQueueRepository.getPending();
      set({ 
        lastSyncTime: Date.now(),
        pendingItemsCount: remaining.length 
      });

    } catch (error) {
      console.error('Queue processing failed entirely', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  pullRemoteData: async () => {
    const { isOnline, isSyncing } = get();
    const { user } = useAuthStore.getState();

    if (!isOnline || isSyncing || !user) return;

    set({ isSyncing: true });

    try {
      await CloudSyncService.pullAllUserData(user.uid);
      set({ lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Failed to pull remote user data:', error);
    } finally {
      set({ isSyncing: false });
    }
  },
}));
