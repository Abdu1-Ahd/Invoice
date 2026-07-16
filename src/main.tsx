import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Router } from './app/Router'
import { useAuthStore } from './features/auth/store/auth.store'

// Initialize Firebase Auth listener immediately
useAuthStore.getState().initializeAuthListener()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
