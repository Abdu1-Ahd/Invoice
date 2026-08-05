import { db } from './db';
import { SyncQueueItem } from '@/domain/sync';

export class SyncQueueRepository {
  /**
   * Fetch all pending sync queue items sorted chronologically.
   */
  static async getPending(): Promise<SyncQueueItem[]> {
    const all = await db.syncQueue.toArray();
    return all
      .filter((item) => 
        item.status === 'PENDING' || (item.status === 'ERROR' && (item.retryCount || 0) < 3)
      )
      .sort((a, b) => a.createdAt - b.createdAt); // oldest first to maintain correct sequence
  }

  /**
   * Remove item from queue after successful sync.
   */
  static async remove(id: string): Promise<void> {
    await db.syncQueue.delete(id);
  }

  /**
   * Remove multiple items from queue after successful batched sync.
   */
  static async removeMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await db.syncQueue.bulkDelete(ids);
  }

  /**
   * Mark item as error and increment retryCount.
   */
  static async markError(id: string): Promise<void> {
    const existing = await db.syncQueue.get(id);
    if (existing) {
      const retryCount = (existing.retryCount || 0) + 1;
      const newStatus = retryCount >= 3 ? 'FAILED' : 'ERROR';
      await db.syncQueue.put({ ...existing, status: newStatus, retryCount });
    }
  }

  /**
   * Clear the entire queue (e.g. on full remote wipe).
   */
  static async clear(): Promise<void> {
    await db.syncQueue.clear();
  }
}
