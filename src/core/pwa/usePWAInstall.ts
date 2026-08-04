/**
 * Ledgerly — PWA Install Hook
 * Location: src/core/pwa/usePWAInstall.ts
 *
 * Manages the complete install lifecycle:
 *   - Captures beforeinstallprompt before browser fires it (desktop/Android)
 *   - Detects iOS (which blocks beforeinstallprompt entirely)
 *   - Detects if already running as standalone (installed)
 *   - Persists dismissal with a 7-day cooldown
 *
 * Usage:
 *   const { canInstall, isInstalled, isIOS, triggerInstall, dismissInstall } = usePWAInstall();
 */

import { useState, useEffect, useCallback } from 'react';

const DISMISS_KEY = 'ledgerly_pwa_install_dismissed_at';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAInstallState {
  /** True if the browser has a pending install prompt (desktop / Android) */
  canInstall: boolean;
  /** True if the app is already running in standalone mode (installed) */
  isInstalled: boolean;
  /** True if running on iOS (Safari) — requires manual "Add to Home Screen" */
  isIOS: boolean;
  /** True if the user has dismissed the prompt within the cooldown window */
  isDismissed: boolean;
  /** Trigger the native install prompt (desktop/Android only) */
  triggerInstall: () => Promise<void>;
  /** Dismiss the install banner and start the cooldown timer */
  dismissInstall: () => void;
}

function detectIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPad on iOS 13+ reports as MacIntel
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS standalone detection
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isDismissedWithinCooldown(): boolean {
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return false;
  const elapsed = Date.now() - parseInt(dismissedAt, 10);
  return elapsed < COOLDOWN_MS;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(isStandalone());
  const [isDismissed, setIsDismissed] = useState<boolean>(isDismissedWithinCooldown);
  const isIOS = detectIOS();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the default browser mini-info bar from appearing
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Track display-mode changes (user installs via browser menu)
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    standaloneQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  }, []);

  const canInstall = Boolean(deferredPrompt) && !isInstalled;

  return {
    canInstall,
    isInstalled,
    isIOS,
    isDismissed,
    triggerInstall,
    dismissInstall,
  };
}
