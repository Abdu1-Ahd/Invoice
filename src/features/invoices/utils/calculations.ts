import { InvoiceItemPayload } from '@/domain/invoice';

export function calculateInvoiceTotals(
  items: InvoiceItemPayload[],
  taxRate: number,
  discount?: { type: 'percentage' | 'fixed'; value: number }
): { subtotal: number; discountAmount: number; taxableAmount: number; taxAmount: number; totalAmount: number } {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  
  let discountAmount = 0;
  if (discount && discount.value > 0) {
    if (discount.type === 'percentage') {
      discountAmount = subtotal * (discount.value / 100);
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    }
  }
  
  // Ensure we don't discount below 0
  discountAmount = Math.min(discountAmount, subtotal);
  
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const totalAmount = taxableAmount + taxAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}
