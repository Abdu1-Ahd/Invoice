import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '@/core/auth/auth.service';

interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuthListener: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true, // Wait for Firebase to check local indexedDB cache

  signInWithGoogle: async () => {
    await AuthService.signInWithGoogle();
  },

  signOut: async () => {
    await AuthService.signOut();
  },

  initializeAuthListener: () => {
    AuthService.onAuthStateChanged((user) => {
      set({
        user,
        isAuthenticated: !!user,
        isInitializing: false,
      });
    });
  },
}));
