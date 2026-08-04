/**
 * Ledgerly — PWA Update Hook
 * Location: src/core/pwa/usePWAUpdate.ts
 *
 * Manages the SW update lifecycle:
 *   - Detects when a new SW version has installed and is waiting
 *   - Exposes updateAvailable flag for the UI to display the update banner
 *   - applyUpdate() posts SKIP_WAITING to the waiting SW, then reloads
 *     the page ONLY after the user explicitly consents
 *
 * Never auto-reloads without user consent (prevents destroying in-progress work).
 *
 * Usage:
 *   const { updateAvailable, applyUpdate } = usePWAUpdate();
 */

import { useState, useEffect, useCallback } from 'react';

export interface PWAUpdateState {
  /** True when a new app version is available and waiting to activate */
  updateAvailable: boolean;
  /** Apply the update: post SKIP_WAITING, then reload when controller changes */
  applyUpdate: () => void;
}

export function usePWAUpdate(): PWAUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // The sw.registration.ts module fires a custom DOM event when an update is found.
    // This decouples the hook from needing a direct ref to the SW registration.
    const handleUpdateReady = (event: Event) => {
      const { worker } = (event as CustomEvent<{ worker: ServiceWorker }>).detail;
      setWaitingWorker(worker);
      setUpdateAvailable(true);
    };

    window.addEventListener('ledgerly:sw-update-ready', handleUpdateReady);

    // Also check for any already-waiting worker on mount
    navigator.serviceWorker.getRegistration('/').then((registration) => {
      if (registration?.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(registration.waiting);
        setUpdateAvailable(true);
      }
    });

    return () => {
      window.removeEventListener('ledgerly:sw-update-ready', handleUpdateReady);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;

    // Listen for the controller to change (new SW takes over)
    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, {
      once: true,
    });

    // Tell the waiting SW to skip waiting and activate immediately
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }, [waitingWorker]);

  return { updateAvailable, applyUpdate };
}
