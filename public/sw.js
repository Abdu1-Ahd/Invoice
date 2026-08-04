/**
 * Ledgerly — Production Service Worker
 *
 * Architecture: Hand-crafted (no Workbox) to keep the bundle lean.
 * Cache strategy by resource type:
 *
 *   ledgerly-shell-v1      → Cache First  — HTML shell, manifest
 *   ledgerly-static-v1     → Cache First  — Vite-hashed JS/CSS (immutable filenames)
 *   ledgerly-fonts-v1      → Stale While Revalidate — Google Fonts CSS + woff2
 *   ledgerly-images-v1     → Cache First  — PNG, SVG, ICO, WEBP
 *   ledgerly-firebase-v1   → Network First — Firebase/Firestore API calls
 *   ledgerly-runtime-v1    → Network First — Anything else (fallback)
 *
 * Security:
 *   - Firebase Auth tokens and Firestore payloads are NEVER stored in cache.
 *   - Only static/font/image assets are stored in Cache Storage.
 *   - CSP-compatible; no eval or inline script injection.
 */

// ---------------------------------------------------------------------------
// Cache versioning
// ---------------------------------------------------------------------------

const CACHE_VERSION = 'v1';

const CACHE_NAMES = {
  shell:    `ledgerly-shell-${CACHE_VERSION}`,
  static:   `ledgerly-static-${CACHE_VERSION}`,
  fonts:    `ledgerly-fonts-${CACHE_VERSION}`,
  images:   `ledgerly-images-${CACHE_VERSION}`,
  firebase: `ledgerly-firebase-${CACHE_VERSION}`,
  runtime:  `ledgerly-runtime-${CACHE_VERSION}`,
};

/**
 * Assets to pre-cache during SW install.
 * Only the app shell — the Vite-hashed bundles are cached on first fetch.
 * Keep this list small to avoid blocking SW installation.
 */
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assets/icon.png',
];

// ---------------------------------------------------------------------------
// URL matching helpers
// ---------------------------------------------------------------------------

/** Vite-hashed bundles — filenames contain a content hash segment */
const isStaticAsset = (url) =>
  /\.(js|css|ts|tsx)$/.test(url.pathname) && url.pathname.startsWith('/assets/');

/** Google Fonts and other font resources */
const isFontRequest = (url) =>
  url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

/** Image assets — PNG, SVG, ICO, WEBP, JPG */
const isImageAsset = (url) =>
  /\.(png|svg|ico|webp|jpg|jpeg|gif)$/.test(url.pathname);

/** Firebase / Firestore API calls — must NOT be cached (contain auth tokens) */
const isFirebaseRequest = (url) =>
  url.hostname.includes('firebase') ||
  url.hostname.includes('firestore') ||
  url.hostname.includes('googleapis.com') ||
  url.hostname.includes('identitytoolkit') ||
  url.hostname.includes('securetoken');

/** SPA navigation requests — HTML document fetches */
const isNavigationRequest = (request) =>
  request.mode === 'navigate';

// ---------------------------------------------------------------------------
// Cache strategy implementations
// ---------------------------------------------------------------------------

/**
 * Cache First: serve from cache; fetch + update cache on miss.
 * Used for: shell HTML, static hashed assets, images.
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return a simple offline response for navigations if nothing cached
    if (isNavigationRequest(request)) {
      const shellCache = await caches.open(CACHE_NAMES.shell);
      const shell = await shellCache.match('/');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network First: try network; fall back to cache on failure.
 * Used for: Firebase API, runtime dynamic requests.
 * Sensitive API responses (Firebase) are NOT cached.
 */
async function networkFirst(request, cacheName, shouldCache = true) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && shouldCache) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // SPA fallback: return shell for navigation misses
    if (isNavigationRequest(request)) {
      const shellCache = await caches.open(CACHE_NAMES.shell);
      const shell = await shellCache.match('/');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Stale While Revalidate: serve cache immediately; update cache in background.
 * Used for: Google Fonts (changes rarely but should eventually update).
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached); // silently fall back to cached on error

  return cached || fetchPromise;
}

// ---------------------------------------------------------------------------
// Service Worker lifecycle — Install
// ---------------------------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAMES.shell)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => {
        // Immediately activate this SW without waiting for existing clients to close.
        // The update banner in the React app handles user notification & reload consent.
        return self.skipWaiting();
      })
  );
});

// ---------------------------------------------------------------------------
// Service Worker lifecycle — Activate
// ---------------------------------------------------------------------------

self.addEventListener('activate', (event) => {
  const validCacheNames = new Set(Object.values(CACHE_NAMES));

  event.waitUntil(
    caches
      .keys()
      .then((existingCaches) => {
        return Promise.all(
          existingCaches
            .filter((name) => !validCacheNames.has(name))
            .map((name) => {
              console.log(`[SW] Deleting stale cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all open clients immediately.
        return self.clients.claim();
      })
  );
});

// ---------------------------------------------------------------------------
// Service Worker lifecycle — Fetch
// ---------------------------------------------------------------------------

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept http/https requests
  if (!url.protocol.startsWith('http')) return;

  // ── Firebase / Firestore API ── Network First, NO cache storage
  if (isFirebaseRequest(url)) {
    event.respondWith(networkFirst(request, CACHE_NAMES.firebase, false));
    return;
  }

  // ── Google Fonts ── Stale While Revalidate
  if (isFontRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.fonts));
    return;
  }

  // ── Vite-hashed static bundles ── Cache First (content-hashed = immutable)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.static));
    return;
  }

  // ── Image assets ── Cache First
  if (isImageAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.images));
    return;
  }

  // ── SPA navigation ── Cache First for shell (offline SPA support)
  if (isNavigationRequest(request)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.shell));
    return;
  }

  // ── Everything else ── Network First with runtime cache
  event.respondWith(networkFirst(request, CACHE_NAMES.runtime));
});

// ---------------------------------------------------------------------------
// Message handler — supports SKIP_WAITING command from React update banner
// ---------------------------------------------------------------------------

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
