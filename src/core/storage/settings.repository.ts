import { v4 as uuidv4 } from 'uuid';
import { getDB } from './db';
import { Settings, SettingsPayload } from '@/domain/settings';

// We assume a single user for this local offline app
const DEFAULT_SETTINGS_ID = 'local-settings';

export class SettingsRepository {
  /**
   * Fetch settings. If they don't exist, return defaults.
   */
  static async get(): Promise<Settings> {
    const db = await getDB();
    const settings = await db.get('settings', DEFAULT_SETTINGS_ID);
    
    if (settings) return settings;

    // Return defaults if none exist
    return {
      id: DEFAULT_SETTINGS_ID,
      agencyName: '',
      logoBase64: '',
      defaultTaxRate: 0,
      defaultTerms: 'Net 30',
      currency: 'USD',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Update settings
   */
  static async update(payload: SettingsPayload): Promise<Settings> {
    const db = await getDB();
    const existing = await this.get();
    
    const now = Date.now();
    const updated: Settings = {
      ...existing,
      ...payload,
      updatedAt: now,
    };

    const tx = db.transaction(['settings', 'syncQueue'], 'readwrite');
    await tx.objectStore('settings').put(updated);
    
    await tx.objectStore('syncQueue').add({
      id: uuidv4(),
      entityType: 'settings',
      entityId: DEFAULT_SETTINGS_ID,
      operation: 'UPDATE',
      payload: updated,
      status: 'PENDING',
      createdAt: now,
    });

    await tx.done;
    return updated;
  }
}
