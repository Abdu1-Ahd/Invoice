import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/core/firebase/firebase';
import { SyncQueueItem } from '@/domain/sync';

export class CloudSyncService {
  /**
   * Push a single operation to Firestore.
   */
  static async pushOperation(item: SyncQueueItem): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Cannot sync: user is not authenticated');

    // Path structure: users/{userId}/{entityType}/{entityId}
    const collectionName = item.entityType; // e.g., 'customer', 'invoice'
    const docRef = doc(db, 'users', user.uid, collectionName, item.entityId);

    try {
      if (item.operation === 'CREATE' || item.operation === 'UPDATE') {
        // Set with merge: true to avoid accidentally wiping remote fields not sent in payload
        await setDoc(docRef, item.payload, { merge: true });
      } else if (item.operation === 'DELETE') {
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error(`Error syncing ${item.entityType} ${item.entityId}:`, error);
      throw error;
    }
  }
}
