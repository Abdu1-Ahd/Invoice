/**
 * Ledgerly — Service Worker Registration
 * Location: src/core/pwa/sw.registration.ts
 *
 * Centralized SW lifecycle manager supporting both production and dev environments.
 */

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the application service worker.
 * Call this once at app startup (main.tsx), before React renders.
 */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
      type: import.meta.env.DEV ? 'module' : 'classic',
    });

    swRegistration = registration;

    // Listen for new SW becoming available
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
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

    setInterval(() => {
      registration.update().catch(() => {
        // Silently ignore when offline
      });
    }, 60 * 1000);

    console.log('[SW] Registered successfully:', registration.scope);
  } catch (error) {
    console.warn('[SW] Registration failed:', error);
  }
}

export function getSwRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}
