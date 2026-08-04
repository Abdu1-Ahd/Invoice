# PWA Architecture — Ledgerly

Architecture Decision Record (ADR) for the Progressive Web App implementation.

---

## Overview

Ledgerly is converted into a full production-grade PWA without breaking the existing offline-first, Feature-Sliced Design architecture.

---

## Architectural Decisions

### Decision 1: Hand-crafted Service Worker (No Workbox)

**Chosen:** Custom `public/sw.js`
**Rejected:** `vite-plugin-pwa` / Workbox

**Rationale:**
- Workbox adds ~30 kB to the bundle — violates the "<10 kB entry chunk" performance requirement
- A hand-crafted SW gives precise control over each cache strategy per resource type
- No magic — every caching decision is explicit and auditable
- Vite automatically serves any file in `public/` at the root, so no Vite plugin is needed to register the SW

---

### Decision 2: `src/core/pwa/` Module Location

All PWA infrastructure lives in `src/core/pwa/`:
```
src/core/pwa/
├── sw.registration.ts   ← SW lifecycle manager
├── useNetworkStatus.ts  ← Centralized online/offline hook
├── usePWAInstall.ts     ← Install prompt lifecycle
└── usePWAUpdate.ts      ← SW update detection & consent
```

**Rationale:** `core/` holds domain-agnostic infrastructure (alongside `auth/`, `firebase/`, `sync/`). PWA infrastructure is not a feature — it's infra. FSD rules: correct layer.

---

### Decision 3: Custom DOM Event Bridge for Updates

`sw.registration.ts` fires `window.dispatchEvent(new CustomEvent('ledgerly:sw-update-ready'))` instead of accepting a callback.

**Rationale:**
- Decouples the registration module from any specific React hook or component
- `usePWAUpdate.ts` listens independently — no prop drilling, no ref passing
- Future-proof: other listeners can subscribe to the same event without modifying registration logic

---

### Decision 4: `useNetworkStatus` as Single Source of Truth

**Before:** `useSyncWorker.ts` had inline `window.addEventListener('online'/'offline')` event listeners.
**After:** Both `useSyncWorker.ts` and `OfflineToast.tsx` consume `useNetworkStatus` from `core/pwa/`.

**Rationale:** Eliminates duplicated event listener registration. Single source of truth for network state. Consistent across all consumers.

---

### Decision 5: Update Consent Required

The SW calls `skipWaiting()` during install (enabling fast first activation), but `clients.claim()` is deferred to activate. The React update banner (`PWAUpdateBanner`) sends `SKIP_WAITING` to the *waiting* SW only when the user clicks "Refresh Now".

**Rationale:** Never silently destroys in-progress user work (e.g., mid-invoice editing).

---

## Cache Strategy Matrix

| Cache Layer | Strategy | Resources | Rationale |
|---|---|---|---|
| `ledgerly-shell-v1` | **Cache First** | HTML shell (`/`), manifest | App shell must be available offline immediately |
| `ledgerly-static-v1` | **Cache First** | Vite-hashed JS/CSS bundles | Content-hashed filenames = immutable; safe to serve from cache forever |
| `ledgerly-fonts-v1` | **Stale While Revalidate** | Google Fonts CSS + woff2 | Fonts rarely change; serve instantly, update in background |
| `ledgerly-images-v1` | **Cache First** | PNG, SVG, ICO, WEBP | Static assets; no freshness concern |
| `ledgerly-firebase-v1` | **Network First, NO cache** | Firebase/Firestore API | Auth tokens present in requests — NEVER cache for security |
| `ledgerly-runtime-v1` | **Network First** | Everything else | Dynamic content; prefer fresh, fall back to cache |

---

## Security Considerations

1. **No sensitive data cached** — Firebase API responses containing auth tokens or Firestore data are explicitly excluded from all caches (`shouldCache = false` for Firebase requests).
2. **HTTPS required** — Service Workers only register on HTTPS origins (or localhost). Enforced by the browser.
3. **Scope locked** — SW scope is `/` — serves only same-origin requests.
4. **Cache invalidation** — Version-keyed cache names (`ledgerly-shell-v1`). Bumping `CACHE_VERSION` in `sw.js` deletes all old caches on activation.
5. **CSP compatible** — No `eval`, no inline script injection in the SW.

---

## File Map: New PWA Files

| File | Purpose |
|---|---|
| `public/sw.js` | Production service worker |
| `public/manifest.json` | Web App Manifest |
| `public/icons/` | 18 icon files (all required sizes + maskable + Apple) |
| `src/core/pwa/sw.registration.ts` | SW registration + update event firing |
| `src/core/pwa/useNetworkStatus.ts` | Centralized online/offline hook |
| `src/core/pwa/usePWAInstall.ts` | Install lifecycle hook |
| `src/core/pwa/usePWAUpdate.ts` | Update detection & consent hook |
| `src/shared/components/PWAInstallBanner.tsx` | Custom install prompt UI |
| `src/shared/components/PWAUpdateBanner.tsx` | Update notification UI |
| `src/shared/components/OfflineToast.tsx` | Transient network state toast |

---

## Files Modified

| File | Change |
|---|---|
| `index.html` | Manifest link, Apple meta tags, iOS splash, favicons, OG tags |
| `src/main.tsx` | SW registration call, PWA components mounted at root |
| `src/features/sync/useSyncWorker.ts` | Replaced inline event listeners with `useNetworkStatus` |

---

## PWA Validation Checklist

### Installability
- ✓ Web App Manifest present with all required fields
- ✓ `display: standalone` configured
- ✓ All icon sizes present (72 → 512, maskable, Apple touch)
- ✓ `start_url` defined
- ✓ `theme_color` and `background_color` set
- ✓ HTTPS required (enforced by browser)
- ✓ Service Worker registered with correct scope

### Offline Capability
- ✓ App shell cached on SW install
- ✓ Static assets cached on first fetch (Cache First)
- ✓ Navigation fallback to cached shell when offline
- ✓ IndexedDB remains source of truth — unaffected by SW
- ✓ Firebase sync queue persists offline mutations
- ✓ Online/offline UI feedback (SyncStatusIndicator + OfflineToast)

### Install Experience
- ✓ `beforeinstallprompt` captured and suppressed
- ✓ Custom `PWAInstallBanner` shown (not browser default mini-bar)
- ✓ iOS manual install instructions shown
- ✓ `appinstalled` event tracked
- ✓ Standalone mode detected
- ✓ 7-day dismissal cooldown

### Update Flow
- ✓ `updatefound` detected via `sw.registration.ts`
- ✓ Custom DOM event `ledgerly:sw-update-ready` fired
- ✓ `PWAUpdateBanner` shown with Refresh Now / Later options
- ✓ `SKIP_WAITING` only sent on user consent
- ✓ Page reloads after `controllerchange` event
- ✓ Old caches deleted on activation

### Performance
- ✓ SW does not preload unnecessary assets (shell only)
- ✓ Vite-hashed bundles cached on first request (not preloaded)
- ✓ Fonts use Stale While Revalidate (instant + background update)
- ✓ No Workbox overhead (~0 kB added to initial bundle)
- ✓ Lazy loading preserved
- ✓ Tree shaking preserved

### Security
- ✓ Firebase API responses never cached
- ✓ Cache version keyed — stale caches auto-deleted
- ✓ SW scope restricted to `/`
- ✓ No eval or inline scripts

### Platform Support
- ✓ Desktop Chrome, Edge, Brave, Arc — `beforeinstallprompt` + custom banner
- ✓ Android Chrome — `beforeinstallprompt` + native install
- ✓ iOS Safari — Apple meta tags + manual "Add to Home Screen" instructions
- ✓ iPad — Apple touch icons (167x167) + splash support
- ✓ Windows — Microsoft tile meta tags
