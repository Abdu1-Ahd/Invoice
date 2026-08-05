import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { Settings, SettingsPayload } from '@/domain/settings';
import { triggerInstantSync } from '@/features/sync/utils/syncTrigger';

// We assume a single user for this local offline app
const DEFAULT_SETTINGS_ID = 'local-settings';

export class SettingsRepository {
  /**
   * Fetch settings. If they don't exist, return defaults.
   */
  static async get(): Promise<Settings> {
    const settings = await db.settings.get(DEFAULT_SETTINGS_ID);
    
    if (settings) {
      return settings;
    }

    // Return defaults if none exist
    return {
      id: DEFAULT_SETTINGS_ID,
      agencyName: '',
      logoBase64: '',
      defaultTaxRate: 0,
      defaultTerms: 'Net 30',
      currency: 'PKR',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Update settings
   */
  static async update(payload: SettingsPayload): Promise<Settings> {
    const existing = await this.get();
    
    const now = Date.now();
    const updated: Settings = {
      ...existing,
      ...payload,
      updatedAt: now,
    };

    await db.transaction('rw', [db.settings, db.syncQueue], async () => {
      await db.settings.put(updated);
      
      await db.syncQueue.put({
        id: uuidv4(),
        entityType: 'settings',
        entityId: DEFAULT_SETTINGS_ID,
        operation: 'UPDATE',
        payload: updated,
        status: 'PENDING',
        createdAt: now,
      });
    });

    triggerInstantSync();
    return updated;
  }
}
