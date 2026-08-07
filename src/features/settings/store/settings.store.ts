import { create } from 'zustand';
import { Settings, SettingsPayload } from '@/domain/settings';
import { SettingsRepository } from '@/core/storage/settings.repository';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  loadSettings: () => Promise<void>;
  updateSettings: (payload: SettingsPayload) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  loadSettings: async () => {
    if (!get().isInitialized) set({ isLoading: true, error: null });
    try {
      const settings = await SettingsRepository.get();
      set({ settings, isLoading: false, isInitialized: true });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateSettings: async (payload: SettingsPayload) => {
    try {
      const updated = await SettingsRepository.update(payload);
      set({ settings: updated });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
