/**
 * Ledgerly — PWA Install Banner
 * Location: src/shared/components/PWAInstallBanner.tsx
 *
 * Custom install prompt component — never relies solely on browser default UI.
 *
 * Handles three install scenarios:
 *   1. Desktop / Android: captures beforeinstallprompt → shows custom banner
 *   2. iOS: shows manual "Add to Home Screen" instructions
 *   3. Already installed / dismissed within cooldown: renders nothing
 *
 * Design: matches existing Ledgerly dark-mode design system tokens.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { usePWAInstall } from '@/core/pwa/usePWAInstall';
import { cn } from '@/shared/utils/cn';

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, isInstalled, isIOS, isDismissed, triggerInstall, dismissInstall } =
    usePWAInstall();

  // Don't show if: already installed, dismissed within cooldown, or nothing to show
  if (isInstalled || isDismissed) return null;
  if (!canInstall && !isIOS) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="pwa-install-banner"
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className={cn(
          'fixed z-50 flex items-center gap-3 rounded-xl border border-border bg-surface shadow-xl',
          // Desktop: bottom-right corner
          'bottom-6 right-6 max-w-sm px-4 py-3',
          // Mobile: full-width above the bottom nav
          'max-[768px]:bottom-20 max-[768px]:left-3 max-[768px]:right-3 max-[768px]:max-w-none'
        )}
        role="dialog"
        aria-label="Install Ledgerly app"
        aria-modal="false"
      >
        {/* App Icon */}
        <img
          src="/assets/icon.png"
          alt="Ledgerly"
          className="h-10 w-10 flex-shrink-0 rounded-lg object-contain"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary leading-snug">
            Install Ledgerly
          </p>
          {isIOS ? (
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              Tap{' '}
              <Share className="inline h-3 w-3 mb-0.5" aria-label="Share icon" />
              {' '}then{' '}
              <strong className="text-text-secondary">Add to Home Screen</strong>
            </p>
          ) : (
            <p className="text-xs text-text-muted mt-0.5">
              Install for offline access &amp; faster loading
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Install button — only for desktop/Android (iOS uses manual flow) */}
          {canInstall && !isIOS && (
            <button
              id="pwa-install-btn"
              onClick={triggerInstall}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              aria-label="Install app"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
          )}

          {/* Dismiss button */}
          <button
            id="pwa-install-dismiss-btn"
            onClick={dismissInstall}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-muted hover:text-text-primary"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
