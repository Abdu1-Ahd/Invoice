import { doc, setDoc, collection, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db, auth } from '@/core/firebase/firebase';
import { SyncQueueItem } from '@/domain/sync';
import { getDB } from '@/core/storage/db';

export class CloudSyncService {
  /**
   * Remove undefined fields to prevent Firestore setDoc errors.
   */
  private static sanitizePayload(payload: any): any {
    if (!payload || typeof payload !== 'object') return payload;
    return JSON.parse(JSON.stringify(payload));
  }

  /**
   * Push a batch of operations to Firestore in atomic chunks of 500 (Technique 3).
   */
  static async pushBatch(items: SyncQueueItem[]): Promise<string[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('Cannot sync: user is not authenticated');

    const successfulIds: string[] = [];
    const chunkSize = 500; // Firestore maximum operations per batch

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      const chunkIds: string[] = [];

      for (const item of chunk) {
        const docRef = doc(db, 'users', user.uid, item.entityType, item.entityId);
        if (item.operation === 'CREATE' || item.operation === 'UPDATE') {
          const cleanPayload = this.sanitizePayload(item.payload);
          batch.set(docRef, cleanPayload, { merge: true });
        } else if (item.operation === 'DELETE') {
          // Tombstoning on delete so delta sync propagates removals across devices
          const now = Date.now();
          const tombstone = {
            id: item.entityId,
            deletedAt: item.payload?.deletedAt || now,
            updatedAt: item.payload?.updatedAt || now,
          };
          batch.set(docRef, this.sanitizePayload(tombstone), { merge: true });
        }
        chunkIds.push(item.id);
      }

      await batch.commit();
      successfulIds.push(...chunkIds);
    }

    return successfulIds;
  }

  /**
   * Fallback: Push a single operation to Firestore.
   */
  static async pushOperation(item: SyncQueueItem): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Cannot sync: user is not authenticated');

    const docRef = doc(db, 'users', user.uid, item.entityType, item.entityId);

    try {
      if (item.operation === 'CREATE' || item.operation === 'UPDATE') {
        const cleanPayload = this.sanitizePayload(item.payload);
        await setDoc(docRef, cleanPayload, { merge: true });
      } else if (item.operation === 'DELETE') {
        const now = Date.now();
        const tombstone = {
          id: item.entityId,
          deletedAt: item.payload?.deletedAt || now,
          updatedAt: item.payload?.updatedAt || now,
        };
        await setDoc(docRef, this.sanitizePayload(tombstone), { merge: true });
      }
    } catch (error) {
      console.error(`Error syncing ${item.entityType} ${item.entityId}:`, error);
      throw error;
    }
  }

  /**
   * Pull user documents from Firestore using Timestamp Delta Sync (Technique 1)
   * and unpack embedded invoice line items (Technique 2).
   */
  static async pullAllUserData(userId: string): Promise<void> {
    const collectionsMap: Record<string, 'invoices' | 'customers' | 'invoiceItems' | 'settings' | 'payments'> = {
      invoice: 'invoices',
      customer: 'customers',
      invoiceItem: 'invoiceItems',
      settings: 'settings',
      payment: 'payments',
    };

    const localDb = await getDB();
    const lastSyncKey = `ledgerly_last_sync_${userId}`;
    const lastSync = Number(localStorage.getItem(lastSyncKey)) || 0;
    const pullStartTime = Date.now();

    for (const [entityType, storeName] of Object.entries(collectionsMap)) {
      try {
        const colRef = collection(db, 'users', userId, entityType);
        // Apply delta query if we have previously synced this user
        const q = lastSync > 0 ? query(colRef, where('updatedAt', '>', lastSync)) : colRef;
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();

            // Technique 2: Unpack embedded line items when pulling an invoice
            if (entityType === 'invoice' && Array.isArray(data.items)) {
              const items = data.items;
              const cleanInvoice = { ...data };
              delete cleanInvoice.items;

              const invoiceTx = localDb.transaction('invoices', 'readwrite');
              await invoiceTx.objectStore('invoices').put(cleanInvoice);
              await invoiceTx.done;

              if (items.length > 0) {
                const itemsTx = localDb.transaction('invoiceItems', 'readwrite');
                const itemsStore = itemsTx.objectStore('invoiceItems');
                for (const item of items) {
                  await itemsStore.put(item);
                }
                await itemsTx.done;
              }
            } else {
              const tx = localDb.transaction(storeName, 'readwrite');
              await tx.objectStore(storeName).put(data);
              await tx.done;
            }
          }
        }
      } catch (err) {
        console.error(`Failed to pull collection ${entityType} for user ${userId}:`, err);
      }
    }

    // Save success timestamp for future delta pulls
    localStorage.setItem(lastSyncKey, String(pullStartTime));
  }
}


