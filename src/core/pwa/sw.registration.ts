/**
 * Ledgerly — Service Worker Registration
 * Location: src/core/pwa/sw.registration.ts
 *
 * Centralized SW lifecycle manager. Only registers in production.
 *
 * When a new SW version is found, fires a custom DOM event:
 *   window.dispatchEvent(new CustomEvent('ledgerly:sw-update-ready', { detail: { worker } }))
 *
 * This decouples registration from any React hooks — usePWAUpdate.ts
 * subscribes to this event independently, requiring no callback wiring.
 */

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the production service worker.
 * Call this once at app startup (main.tsx), before React renders.
 */
export async function registerServiceWorker(): Promise<void> {
  // Only register in production and when the browser supports service workers
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      // updateViaCache: 'none' forces the browser to always check the SW
      // script from the network, ensuring updates are never missed.
      updateViaCache: 'none',
    });

    swRegistration = registration;

    // Listen for new SW becoming available
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
        // A new SW has finished installing and is waiting to activate.
        // Fire a custom event so usePWAUpdate.ts can show the update banner.
        if (
          installingWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          window.dispatchEvent(
            new CustomEvent('ledgerly:sw-update-ready', {
              detail: { worker: installingWorker },
            })
          );
        }
      });
    });

    // Periodically check for SW updates (every 60 seconds when online).
    // The browser de-dupes rapid calls, so this is safe.
    setInterval(() => {
      registration.update().catch(() => {
        // Silently ignore — can fail when offline
      });
    }, 60 * 1000);

    console.log('[SW] Registered successfully:', registration.scope);
  } catch (error) {
    // SW registration failure must NEVER block app startup
    console.warn('[SW] Registration failed:', error);
  }
}

/**
 * Get the current SW registration (if available).
 * Exposed for any future direct SW interaction needs.
 */
export function getSwRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}
