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
      .filter((item: SyncQueueItem & { retryCount?: number }) => 
        item.status === 'PENDING' || (item.status === 'ERROR' && (item.retryCount || 0) < 3)
      )
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
   * Remove multiple items from queue after successful batched sync.
   */
  static async removeMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await getDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    for (const id of ids) {
      await store.delete(id);
    }
    await tx.done;
  }

  /**
   * Mark item as error and increment retryCount.
   */
  static async markError(id: string): Promise<void> {
    const db = await getDB();
    const existing = await db.get('syncQueue', id);
    if (existing) {
      const retryCount = (existing.retryCount || 0) + 1;
      const newStatus = retryCount >= 3 ? 'FAILED' : 'ERROR';
      await db.put('syncQueue', { ...existing, status: newStatus, retryCount });
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
