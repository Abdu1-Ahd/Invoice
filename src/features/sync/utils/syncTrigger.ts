import { useSyncStore } from '@/features/sync/store/sync.store';

/**
 * Reactively triggers queue processing without blocking synchronous transactions or rendering.
 */
export const triggerInstantSync = (): void => {
  setTimeout(() => {
    const { processQueue } = useSyncStore.getState();
    processQueue();
  }, 50);
};
