import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Router } from './app/Router'
import { useAuthStore } from './features/auth/store/auth.store'
import { useSettingsStore } from './features/settings/store/settings.store'

// Initialize Firebase Auth and stored Theme Settings immediately on app boot
useAuthStore.getState().initializeAuthListener()
useSettingsStore.getState().loadSettings()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
