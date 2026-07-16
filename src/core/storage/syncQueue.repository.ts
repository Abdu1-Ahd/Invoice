import { getDB } from './db';
import { SyncQueueItem } from '@/domain/sync';

export class SyncQueueRepository {
  /**
   * Fetch all pending sync queue items sorted chronologically.
   */
  static async getPending(): Promise<SyncQueueItem[]> {
    const db = await getDB();
    const all = await db.getAll('syncQueue');
    return all
      .filter((item: SyncQueueItem) => item.status === 'PENDING' || item.status === 'ERROR')
      .sort((a, b) => a.createdAt - b.createdAt); // oldest first to maintain correct sequence
  }

  /**
   * Remove item from queue after successful sync.
   */
  static async remove(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('syncQueue', id);
  }

  /**
   * Mark item as error.
   */
  static async markError(id: string): Promise<void> {
    const db = await getDB();
    const existing = await db.get('syncQueue', id);
    if (existing) {
      await db.put('syncQueue', { ...existing, status: 'ERROR' });
    }
  }

  /**
   * Clear the entire queue (e.g. on full remote wipe).
   */
  static async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('syncQueue');
  }
}
