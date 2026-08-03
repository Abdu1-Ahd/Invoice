import { v4 as uuidv4 } from 'uuid';
import { getDB } from './db';
import { Invoice, InvoiceItem, FullInvoicePayload } from '@/domain/invoice';
import { calculateInvoiceTotals } from '@/features/invoices/utils/calculations';
import { triggerInstantSync } from '@/features/sync/utils/syncTrigger';

export class InvoiceRepository {
  /**
   * Fetch all active invoices.
   */
  static async findAll(): Promise<Invoice[]> {
    const db = await getDB();
    const all = await db.getAll('invoices');
    return all.filter((i: Invoice) => i.deletedAt === null).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Fetch full invoice (invoice + items).
   */
  static async findFullById(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] } | undefined> {
    const db = await getDB();
    const invoice = await db.get('invoices', id);
    if (!invoice || invoice.deletedAt !== null) return undefined;

    const itemsIndex = db.transaction('invoiceItems').store.index('by-invoice');
    let items = await itemsIndex.getAll(id);
    items = items.filter((i: InvoiceItem) => i.deletedAt === null);

    return { invoice, items };
  }

  /**
   * Create a new invoice and its items (Technique 2: embedded items in a single sync write).
   */
  static async create(payload: FullInvoicePayload): Promise<Invoice> {
    const db = await getDB();
    const now = Date.now();
    const invoiceId = uuidv4();

    const { subtotal, discountAmount, taxableAmount, taxAmount, totalAmount } = calculateInvoiceTotals(
      payload.items, 
      payload.invoice.taxRate,
      payload.invoice.discount
    );

    const newInvoice: Invoice = {
      ...payload.invoice,
      id: invoiceId,
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      totalAmount,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const newItems: InvoiceItem[] = payload.items.map(item => ({
      ...item,
      id: uuidv4(),
      invoiceId,
      total: Number((item.quantity * item.unitPrice).toFixed(2)),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }));

    const tx = db.transaction(['invoices', 'invoiceItems', 'syncQueue'], 'readwrite');
    
    await tx.objectStore('invoices').add(newInvoice);
    // Embed items directly inside invoice payload to avoid N extra Firestore writes
    await tx.objectStore('syncQueue').add({
      id: uuidv4(),
      entityType: 'invoice',
      entityId: newInvoice.id,
      operation: 'CREATE',
      payload: { ...newInvoice, items: newItems },
      status: 'PENDING',
      createdAt: now,
    });

    for (const item of newItems) {
      await tx.objectStore('invoiceItems').add(item);
    }

    await tx.done;
    triggerInstantSync();
    return newInvoice;
  }

  /**
   * Update invoice status (e.g. mark as Paid).
   */
  static async updateStatus(id: string, status: Invoice['status']): Promise<void> {
    const db = await getDB();
    const existing = await db.get('invoices', id);
    if (!existing || existing.deletedAt !== null) throw new Error('Invoice not found');

    const now = Date.now();
    const updatedInvoice: Invoice = { ...existing, status, updatedAt: now };

    const tx = db.transaction(['invoices', 'syncQueue'], 'readwrite');
    await tx.objectStore('invoices').put(updatedInvoice);
    await tx.objectStore('syncQueue').add({
      id: uuidv4(),
      entityType: 'invoice',
      entityId: id,
      operation: 'UPDATE',
      payload: updatedInvoice,
      status: 'PENDING',
      createdAt: now,
    });

    await tx.done;
    triggerInstantSync();
  }

  /**
   * Soft delete an invoice and its items (Technique 2: single delete sync operation).
   */
  static async delete(id: string): Promise<void> {
    const db = await getDB();
    const existing = await db.get('invoices', id);
    if (!existing || existing.deletedAt !== null) return;

    const now = Date.now();
    const updatedInvoice = { ...existing, deletedAt: now, updatedAt: now };

    const itemsIndex = db.transaction('invoiceItems').store.index('by-invoice');
    const items = await itemsIndex.getAll(id);

    const tx = db.transaction(['invoices', 'invoiceItems', 'syncQueue'], 'readwrite');
    
    await tx.objectStore('invoices').put(updatedInvoice);
    await tx.objectStore('syncQueue').add({
      id: uuidv4(),
      entityType: 'invoice',
      entityId: id,
      operation: 'DELETE',
      payload: { deletedAt: now, updatedAt: now },
      status: 'PENDING',
      createdAt: now,
    });

    for (const item of items) {
      if (item.deletedAt !== null) continue;
      const updatedItem = { ...item, deletedAt: now, updatedAt: now };
      await tx.objectStore('invoiceItems').put(updatedItem);
    }

    await tx.done;
    triggerInstantSync();
  }
}

