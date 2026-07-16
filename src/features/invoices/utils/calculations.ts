import { InvoiceItemPayload } from '@/domain/invoice';

export function calculateInvoiceTotals(
  items: InvoiceItemPayload[],
  taxRate: number
): { subtotal: number; taxAmount: number; totalAmount: number } {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}
