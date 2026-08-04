import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Router } from './app/Router'
import { useAuthStore } from './features/auth/store/auth.store'
import { useSettingsStore } from './features/settings/store/settings.store'
import { registerServiceWorker } from './core/pwa/sw.registration'
import { PWAInstallBanner } from './shared/components/PWAInstallBanner'
import { PWAUpdateBanner } from './shared/components/PWAUpdateBanner'
import { OfflineToast } from './shared/components/OfflineToast'

// Initialize Firebase Auth and stored Theme Settings immediately on app boot
useAuthStore.getState().initializeAuthListener()
useSettingsStore.getState().loadSettings()

// Register the production service worker (no-op in development)
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* PWA infrastructure — mounted at root to be available across all routes */}
    <PWAUpdateBanner />
    <PWAInstallBanner />
    <OfflineToast />
    <Router />
  </StrictMode>,
)
