/**
 * Ledgerly — Offline Toast
 * Location: src/shared/components/OfflineToast.tsx
 *
 * Transient notification that fires on network *state transitions*.
 * Complements (not replaces) the persistent SyncStatusIndicator:
 *   - SyncStatusIndicator = persistent status badge in sidebar
 *   - OfflineToast = ephemeral pop-up on transition events only
 *
 * Auto-dismisses after 3.5 seconds.
 * Positioned above the mobile bottom nav to avoid overlap.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/core/pwa/useNetworkStatus';

type ToastMessage = {
  id: number;
  isOnline: boolean;
  message: string;
};

const AUTO_DISMISS_MS = 3500;

export const OfflineToast: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const prevOnlineRef = useRef<boolean | null>(null);
  const counterRef = useRef<number>(0);

  useEffect(() => {
    // Skip the very first render — only react to *transitions*
    if (prevOnlineRef.current === null) {
      prevOnlineRef.current = isOnline;
      return;
    }

    // Only fire on actual state change
    if (prevOnlineRef.current === isOnline) return;
    prevOnlineRef.current = isOnline;

    const id = ++counterRef.current;
    const message = isOnline
      ? "You're back online — syncing changes..."
      : "You're offline. Changes are saved locally.";

    setToasts((prev) => [...prev, { id, isOnline, message }]);

    // Auto-dismiss after delay
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [isOnline]);

  return (
    <div
      className="fixed bottom-28 safe-bottom-floating left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium shadow-xl pointer-events-auto ${
              toast.isOnline
                ? 'bg-success text-white'
                : 'bg-warning text-white'
            }`}
            role="status"
          >
            {toast.isOnline ? (
              <Wifi className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            ) : (
              <WifiOff className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
