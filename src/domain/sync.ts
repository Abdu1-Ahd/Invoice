import { z } from 'zod';

export const SyncOperationSchema = z.enum(['CREATE', 'UPDATE', 'DELETE']);
export type SyncOperation = z.infer<typeof SyncOperationSchema>;

export const SyncEntitySchema = z.enum(['customer', 'invoice', 'invoiceItem', 'payment', 'settings']);
export type SyncEntity = z.infer<typeof SyncEntitySchema>;

export const SyncStatusSchema = z.enum(['PENDING', 'SYNCING', 'ERROR']);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const SyncQueueItemSchema = z.object({
  id: z.string().uuid(),
  entityType: SyncEntitySchema,
  entityId: z.string(),
  operation: SyncOperationSchema,
  payload: z.any(),
  status: SyncStatusSchema,
  createdAt: z.number(), // Used to maintain chronological order
});

export type SyncQueueItem = z.infer<typeof SyncQueueItemSchema>;
