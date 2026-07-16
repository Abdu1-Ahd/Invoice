import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface InvoiceAppDB extends DBSchema {
  customers: {
    key: string;
    value: any;
  };
  invoices: {
    key: string;
    value: any;
    indexes: { 'by-customer': string };
  };
  invoiceItems: {
    key: string;
    value: any;
    indexes: { 'by-invoice': string };
  };
  payments: {
    key: string;
    value: any;
    indexes: { 'by-invoice': string };
  };
  syncQueue: {
    key: string;
    value: any;
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'invoice_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<InvoiceAppDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<InvoiceAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('invoices')) {
          const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id' });
          invoiceStore.createIndex('by-customer', 'customerId');
        }
        if (!db.objectStoreNames.contains('invoiceItems')) {
          const itemStore = db.createObjectStore('invoiceItems', { keyPath: 'id' });
          itemStore.createIndex('by-invoice', 'invoiceId');
        }
        if (!db.objectStoreNames.contains('payments')) {
          const paymentStore = db.createObjectStore('payments', { keyPath: 'id' });
          paymentStore.createIndex('by-invoice', 'invoiceId');
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};
