import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { Invoice, InvoiceItem, FullInvoicePayload } from '@/domain/invoice';
import { calculateInvoiceTotals } from '@/features/invoices/utils/calculations';
import { triggerInstantSync } from '@/features/sync/utils/syncTrigger';

export class InvoiceRepository {
  /**
   * Fetch all active invoices.
   */
  static async findAll(): Promise<Invoice[]> {
    const all = await db.invoices.toArray();
    return all.filter((i: Invoice) => i.deletedAt === null).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Fetch full invoice (invoice + items).
   */
  static async findFullById(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] } | undefined> {
    const invoice = await db.invoices.get(id);
    if (!invoice || invoice.deletedAt !== null) return undefined;

    let items = await db.invoiceItems.where('invoiceId').equals(id).toArray();
    items = items.filter((i: InvoiceItem) => i.deletedAt === null);

    return { invoice, items };
  }

  /**
   * Create a new invoice and its items (Technique 2: embedded items in a single sync write).
   */
  static async create(payload: FullInvoicePayload): Promise<Invoice> {
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

    await db.transaction('rw', [db.invoices, db.invoiceItems, db.syncQueue], async () => {
      await db.invoices.put(newInvoice);
      // Embed items directly inside invoice payload to avoid N extra Firestore writes
      await db.syncQueue.put({
        id: uuidv4(),
        entityType: 'invoice',
        entityId: newInvoice.id,
        operation: 'CREATE',
        payload: { ...newInvoice, items: newItems },
        status: 'PENDING',
        createdAt: now,
      });

      await db.invoiceItems.bulkPut(newItems);
    });

    triggerInstantSync();
    return newInvoice;
  }

  /**
   * Update invoice status (e.g. mark as Paid).
   */
  static async updateStatus(id: string, status: Invoice['status']): Promise<void> {
    const existing = await db.invoices.get(id);
    if (!existing || existing.deletedAt !== null) throw new Error('Invoice not found');

    const now = Date.now();
    const updatedInvoice: Invoice = { ...existing, status, updatedAt: now };

    await db.transaction('rw', [db.invoices, db.syncQueue], async () => {
      await db.invoices.put(updatedInvoice);
      await db.syncQueue.put({
        id: uuidv4(),
        entityType: 'invoice',
        entityId: id,
        operation: 'UPDATE',
        payload: updatedInvoice,
        status: 'PENDING',
        createdAt: now,
      });
    });

    triggerInstantSync();
  }

  /**
   * Soft delete an invoice and its items (Technique 2: single delete sync operation).
   */
  static async delete(id: string): Promise<void> {
    const existing = await db.invoices.get(id);
    if (!existing || existing.deletedAt !== null) return;

    const now = Date.now();
    const updatedInvoice = { ...existing, deletedAt: now, updatedAt: now };

    const items = await db.invoiceItems.where('invoiceId').equals(id).toArray();

    await db.transaction('rw', [db.invoices, db.invoiceItems, db.syncQueue], async () => {
      await db.invoices.put(updatedInvoice);
      await db.syncQueue.put({
        id: uuidv4(),
        entityType: 'invoice',
        entityId: id,
        operation: 'DELETE',
        payload: { deletedAt: now, updatedAt: now },
        status: 'PENDING',
        createdAt: now,
      });

      const updatedItems = items.map(item => {
        if (item.deletedAt !== null) return item;
        return { ...item, deletedAt: now, updatedAt: now };
      });
      await db.invoiceItems.bulkPut(updatedItems);
    });

    triggerInstantSync();
  }
}
