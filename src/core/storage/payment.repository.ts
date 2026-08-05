import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { Payment, PaymentPayload } from '@/domain/payment';
import { Invoice } from '@/domain/invoice';
import { triggerInstantSync } from '@/features/sync/utils/syncTrigger';

export class PaymentRepository {
  /**
   * Fetch all active payments.
   */
  static async findAll(): Promise<Payment[]> {
    const all = await db.payments.toArray();
    return all.filter((p: Payment) => p.deletedAt === null).sort((a, b) => b.date - a.date);
  }

  /**
   * Create a new payment and automatically update the invoice status if fully paid.
   */
  static async create(payload: PaymentPayload): Promise<Payment> {
    const now = Date.now();
    
    const newPayment: Payment = {
      ...payload,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await db.transaction('rw', [db.payments, db.invoices, db.syncQueue], async () => {
      // Save payment
      await db.payments.put(newPayment);
      await db.syncQueue.put({
        id: uuidv4(),
        entityType: 'payment',
        entityId: newPayment.id,
        operation: 'CREATE',
        payload: newPayment,
        status: 'PENDING',
        createdAt: now,
      });

      // We should check if the invoice is now fully paid
      const invoice = await db.invoices.get(payload.invoiceId);
      if (invoice && invoice.deletedAt === null) {
        // Find all payments for this invoice
        const allInvoicePayments = await db.payments.where('invoiceId').equals(payload.invoiceId).toArray();
        
        const totalPaid = allInvoicePayments
          .filter(p => p.deletedAt === null)
          .reduce((sum, p) => sum + p.amount, 0);

        if (totalPaid >= invoice.totalAmount && invoice.status !== 'Paid') {
          const updatedInvoice: Invoice = { ...invoice, status: 'Paid', updatedAt: now };
          await db.invoices.put(updatedInvoice);
          await db.syncQueue.put({
            id: uuidv4(),
            entityType: 'invoice',
            entityId: invoice.id,
            operation: 'UPDATE',
            payload: updatedInvoice,
            status: 'PENDING',
            createdAt: now,
          });
        }
      }
    });

    triggerInstantSync();
    return newPayment;
  }
}
