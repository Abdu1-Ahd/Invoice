import { v4 as uuidv4 } from 'uuid';
import { getDB } from './db';
import { Payment, PaymentPayload } from '@/domain/payment';

export class PaymentRepository {
  /**
   * Fetch all active payments.
   */
  static async findAll(): Promise<Payment[]> {
    const db = await getDB();
    const all = await db.getAll('payments');
    return all.filter((p: Payment) => p.deletedAt === null).sort((a, b) => b.date - a.date);
  }

  /**
   * Create a new payment and automatically update the invoice status if fully paid.
   */
  static async create(payload: PaymentPayload): Promise<Payment> {
    const db = await getDB();
    const now = Date.now();
    
    const newPayment: Payment = {
      ...payload,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const tx = db.transaction(['payments', 'invoices', 'syncQueue'], 'readwrite');
    
    // Save payment
    await tx.objectStore('payments').add(newPayment);
    await tx.objectStore('syncQueue').add({
      id: uuidv4(),
      entityType: 'payment',
      entityId: newPayment.id,
      operation: 'CREATE',
      payload: newPayment,
      status: 'PENDING',
      createdAt: now,
    });

    // We should check if the invoice is now fully paid
    const invoice = await tx.objectStore('invoices').get(payload.invoiceId);
    if (invoice && invoice.deletedAt === null) {
      // Find all payments for this invoice
      const paymentsIndex = tx.objectStore('payments').index('by-invoice');
      const allInvoicePayments = await paymentsIndex.getAll(payload.invoiceId);
      
      const totalPaid = allInvoicePayments
        .filter(p => p.deletedAt === null)
        .reduce((sum, p) => sum + p.amount, 0);

      if (totalPaid >= invoice.totalAmount && invoice.status !== 'Paid') {
        const updatedInvoice = { ...invoice, status: 'Paid', updatedAt: now };
        await tx.objectStore('invoices').put(updatedInvoice);
        await tx.objectStore('syncQueue').add({
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

    await tx.done;
    return newPayment;
  }
}
