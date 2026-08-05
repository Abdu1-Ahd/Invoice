/**
 * Ledgerly — Production & Offline Service Worker with Manifest Injection
 * Location: src/sw.ts
 *
 * Combines custom cache strategies with Vite PWA's __WB_MANIFEST injection
 * to guarantee that all application JS chunks and styles are available offline.
 */

/// <reference lib="webworker" />

export {};

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v2';

const CACHE_NAMES = {
  shell: `ledgerly-shell-${CACHE_VERSION}`,
  static: `ledgerly-static-${CACHE_VERSION}`,
  fonts: `ledgerly-fonts-${CACHE_VERSION}`,
  images: `ledgerly-images-${CACHE_VERSION}`,
  firebase: `ledgerly-firebase-${CACHE_VERSION}`,
  runtime: `ledgerly-runtime-${CACHE_VERSION}`,
};

// Extract Workbox manifest URLs injected by VitePWA during build (must literally match self.__WB_MANIFEST)
const manifestEntries = ((self as any).__WB_MANIFEST || []).map((entry: any) =>
  typeof entry === 'string' ? entry : entry.url
);

/**
 * Assets to pre-cache during SW install.
 * Combines explicit app shell files with all compiled asset chunks from Vite build.
 */
const PRECACHE_ASSETS = Array.from(
  new Set([
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/assets/icon.png',
    ...manifestEntries,
  ])
);

// ---------------------------------------------------------------------------
// URL matching helpers
// ---------------------------------------------------------------------------

const isStaticAsset = (url: URL) =>
  /\.(js|css|ts|tsx)$/.test(url.pathname) || url.pathname.startsWith('/assets/');

const isFontRequest = (url: URL) =>
  url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

const isImageAsset = (url: URL) =>
  /\.(png|svg|ico|webp|jpg|jpeg|gif)$/.test(url.pathname);

const isFirebaseRequest = (url: URL) =>
  url.hostname.includes('firebase') ||
  url.hostname.includes('firestore') ||
  url.hostname.includes('googleapis.com') ||
  url.hostname.includes('identitytoolkit') ||
  url.hostname.includes('securetoken');

const isNavigationRequest = (request: Request) => request.mode === 'navigate';

// ---------------------------------------------------------------------------
// Cache strategy implementations
// ---------------------------------------------------------------------------

async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
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
    if (isNavigationRequest(request)) {
      const shellCache = await caches.open(CACHE_NAMES.shell);
      const shell = (await shellCache.match('/')) || (await shellCache.match('/index.html'));
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function networkFirst(request: Request, cacheName: string, shouldCache = true): Promise<Response> {
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
    if (isNavigationRequest(request)) {
      const shellCache = await caches.open(CACHE_NAMES.shell);
      const shell = (await shellCache.match('/')) || (await shellCache.match('/index.html'));
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return (cached || await fetchPromise) as Response;
}

// ---------------------------------------------------------------------------
// Service Worker lifecycle — Install
// ---------------------------------------------------------------------------

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(CACHE_NAMES.shell)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => sw.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// Service Worker lifecycle — Activate
// ---------------------------------------------------------------------------

sw.addEventListener('activate', (event: ExtendableEvent) => {
  const validCacheNames = new Set(Object.values(CACHE_NAMES));

  event.waitUntil(
    caches
      .keys()
      .then((existingCaches) =>
        Promise.all(
          existingCaches
            .filter((name) => !validCacheNames.has(name))
            .map((name) => {
              console.log(`[SW] Deleting stale cache: ${name}`);
              return caches.delete(name);
            })
        )
      )
      .then(() => sw.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Service Worker lifecycle — Fetch
// ---------------------------------------------------------------------------

sw.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!url.protocol.startsWith('http')) return;

  if (isFirebaseRequest(url)) {
    event.respondWith(networkFirst(request, CACHE_NAMES.firebase, false));
    return;
  }

  if (isFontRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.fonts));
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.shell));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.static));
    return;
  }
  if (isImageAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.images));
    return;
  }

  event.respondWith(networkFirst(request, CACHE_NAMES.runtime));
});

// ---------------------------------------------------------------------------
// Message handler — SKIP_WAITING
// ---------------------------------------------------------------------------

sw.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }
});
