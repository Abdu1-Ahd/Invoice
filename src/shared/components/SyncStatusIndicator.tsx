import React, { useEffect } from 'react';
import { useSyncStore } from '@/features/sync/store/sync.store';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';


export const SyncStatusIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingItemsCount, checkPendingCount } = useSyncStore();

  useEffect(() => {
    // Check pending count initially and then polling is managed by SyncWorker
    checkPendingCount();
    const interval = setInterval(checkPendingCount, 5000);
    return () => clearInterval(interval);
  }, [checkPendingCount]);

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-warning px-3 py-1.5 bg-warning/10 rounded-full w-fit">
        <CloudOff className="w-3.5 h-3.5" />
        <span>Offline Mode</span>
        {pendingItemsCount > 0 && <span className="ml-1 opacity-75">({pendingItemsCount} pending)</span>}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (pendingItemsCount > 0) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-warning px-3 py-1.5 bg-warning/10 rounded-full w-fit">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>{pendingItemsCount} Unsynced Changes</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-success px-3 py-1.5 bg-success/10 rounded-full w-fit">
      <Cloud className="w-3.5 h-3.5" />
      <span>Cloud Synced</span>
    </div>
  );
};
