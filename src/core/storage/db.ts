import Dexie, { type Table } from 'dexie';
import { Customer } from '@/domain/customer';
import { Invoice, InvoiceItem } from '@/domain/invoice';
import { Payment } from '@/domain/payment';
import { Settings } from '@/domain/settings';
import { SyncQueueItem } from '@/domain/sync';

export interface SyncQueueRecord extends SyncQueueItem {
  retryCount?: number;
}

export class LedgerlyDB extends Dexie {
  customers!: Table<Customer, string>;
  invoices!: Table<Invoice, string>;
  invoiceItems!: Table<InvoiceItem, string>;
  payments!: Table<Payment, string>;
  syncQueue!: Table<SyncQueueRecord, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('invoice_db');

    // Schema version 3 supersedes earlier idb schemas (version 2),
    // cleanly declaring object stores and indexed fields for Dexie.
    this.version(3).stores({
      customers: 'id, updatedAt, deletedAt',
      invoices: 'id, customerId, updatedAt, deletedAt',
      invoiceItems: 'id, invoiceId, updatedAt, deletedAt',
      payments: 'id, invoiceId, date, deletedAt',
      syncQueue: 'id, status, createdAt',
      settings: 'id, updatedAt',
    });
  }
}

export const db = new LedgerlyDB();
export const getDB = async () => db;
