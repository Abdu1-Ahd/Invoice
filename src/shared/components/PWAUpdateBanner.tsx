/**
 * Ledgerly — PWA Update Banner
 * Location: src/shared/components/PWAUpdateBanner.tsx
 *
 * Non-blocking update notification displayed when a new app version is available.
 *
 * Behavior:
 *   - "Refresh Now"  → applies the SW update → page reloads (user consent given)
 *   - "Later"        → dismisses the banner (update applied on next natural reload)
 *
 * Never silently reloads the page. User work is never destroyed without consent.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { usePWAUpdate } from '@/core/pwa/usePWAUpdate';

export const PWAUpdateBanner: React.FC = () => {
  const { updateAvailable, applyUpdate } = usePWAUpdate();
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="pwa-update-banner"
        initial={{ opacity: 0, y: -48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -48 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 bg-primary px-4 py-2.5 shadow-lg"
        role="status"
        aria-live="polite"
        aria-label="New version available"
      >
        {/* Icon */}
        <Sparkles className="h-4 w-4 text-primary-foreground flex-shrink-0" aria-hidden="true" />

        {/* Message */}
        <p className="text-sm font-medium text-primary-foreground flex-1 text-center">
          A new version of Ledgerly is ready
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            id="pwa-update-refresh-btn"
            onClick={applyUpdate}
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-white/30"
            aria-label="Refresh to apply update"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Now
          </button>

          <button
            id="pwa-update-dismiss-btn"
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
