import React from 'react';
import { Invoice, InvoiceItem } from '@/domain/invoice';
import { Customer } from '@/domain/customer';
import { Settings } from '@/domain/settings';
import { formatCurrency } from '@/core/utils/currency';

interface StandardTemplateProps {
  invoice: Invoice;
  items: InvoiceItem[];
  customer: Customer;
  settings: Settings;
  id?: string;
}

export const StandardTemplate: React.FC<StandardTemplateProps> = ({
  invoice,
  items,
  customer,
  settings,
  id,
}) => {
  const currencyCode = invoice.currency || settings.currency || 'PKR';
  const billingAddr = invoice.billingAddress || customer.address || customer.email;

  return (
    <div
      id={id}
      style={{ backgroundColor: '#ffffff', color: '#111827', fontFamily: 'Inter, system-ui, sans-serif' }}
      className="p-12 w-[800px] min-h-[1131px] mx-auto relative"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          {settings.logoBase64 ? (
            <img src={settings.logoBase64} alt="Agency Logo" className="h-16 object-contain mb-4" />
          ) : (
            <h2 style={{ color: '#1f2937' }} className="text-2xl font-bold tracking-tight mb-4">
              {settings.agencyName || 'Your Agency Name'}
            </h2>
          )}
        </div>
        <div className="text-right">
          <h1 style={{ color: '#111827' }} className="text-5xl font-black tracking-tighter uppercase">
            INVOICE
          </h1>
          <p style={{ color: '#6b7280' }} className="text-xl font-medium mt-1">
            {invoice.invoiceNumber}
          </p>
          {invoice.billingCycle && invoice.billingCycle !== 'One-Time' && (
            <span
              style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
              className="inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border"
            >
              {invoice.billingCycle}
            </span>
          )}
        </div>
      </div>

      {/* Bill To & Metadata Grid */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 style={{ color: '#9ca3af' }} className="text-sm font-bold uppercase tracking-widest mb-2">
            Billed To
          </h3>
          <p style={{ color: '#111827' }} className="font-bold text-lg">
            {customer.name}
          </p>
          {billingAddr && (
            <p style={{ color: '#4b5563' }} className="whitespace-pre-wrap leading-relaxed mt-1">
              {billingAddr}
            </p>
          )}
        </div>
        <div className="space-y-3 text-right">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 style={{ color: '#9ca3af' }} className="text-sm font-bold uppercase tracking-widest mb-1">
                Issue Date
              </h3>
              <p style={{ color: '#1f2937' }} className="font-semibold">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 style={{ color: '#9ca3af' }} className="text-sm font-bold uppercase tracking-widest mb-1">
                Due Date
              </h3>
              <p style={{ color: '#1f2937' }} className="font-semibold">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {invoice.paymentMethod && (
            <div>
              <h3 style={{ color: '#9ca3af' }} className="text-xs font-bold uppercase tracking-widest mb-0.5">
                Payment Method
              </h3>
              <p style={{ color: '#374151' }} className="font-medium text-sm">
                {invoice.paymentMethod}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full mb-12 border-collapse">
        <thead>
          <tr style={{ borderBottom: '2px solid #111827' }}>
            <th style={{ color: '#111827' }} className="py-3 text-left text-sm font-bold uppercase tracking-wider w-1/2">
              Description
            </th>
            <th style={{ color: '#111827' }} className="py-3 text-center text-sm font-bold uppercase tracking-wider">
              Qty
            </th>
            <th style={{ color: '#111827' }} className="py-3 text-right text-sm font-bold uppercase tracking-wider">
              Rate
            </th>
            <th style={{ color: '#111827' }} className="py-3 text-right text-sm font-bold uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              style={{ borderBottom: i === items.length - 1 ? '2px solid #111827' : '1px solid #e5e7eb' }}
            >
              <td style={{ color: '#111827' }} className="py-4">
                <p className="font-medium">{item.description}</p>
                {item.subDescription && (
                  <p style={{ color: '#6b7280' }} className="text-sm mt-1 whitespace-pre-wrap leading-snug">
                    {item.subDescription}
                  </p>
                )}
              </td>
              <td style={{ color: '#1f2937' }} className="py-4 text-center">
                {item.quantity}
              </td>
              <td style={{ color: '#1f2937' }} className="py-4 text-right">
                {formatCurrency(item.unitPrice, currencyCode)}
              </td>
              <td style={{ color: '#111827' }} className="py-4 text-right font-medium">
                {formatCurrency(item.total, currencyCode)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Totals */}
      <div className="flex justify-end mb-16">
        <div className="w-80 space-y-3">
          <div style={{ color: '#4b5563' }} className="flex justify-between px-2 text-sm">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(invoice.subtotal, currencyCode)}</span>
          </div>
          {(invoice.discountAmount ?? 0) > 0 && (
            <div style={{ color: '#dc2626' }} className="flex justify-between px-2 text-sm font-medium">
              <span>Discount {invoice.discount?.type === 'percentage' ? `(${invoice.discount.value}%)` : ''}</span>
              <span>-{formatCurrency(invoice.discountAmount!, currencyCode)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div style={{ color: '#4b5563' }} className="flex justify-between px-2 text-sm">
              <span>Tax ({invoice.taxRate}%)</span>
              <span className="font-medium">{formatCurrency(invoice.taxAmount, currencyCode)}</span>
            </div>
          )}
          <div
            style={{ backgroundColor: '#111827', color: '#ffffff' }}
            className="mt-4 p-4 rounded-xl flex justify-between items-center shadow-md"
          >
            <span className="font-bold uppercase tracking-wider text-xs opacity-90">Total Due</span>
            <span className="font-black text-2xl">{formatCurrency(invoice.totalAmount, currencyCode)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Terms / Notes / Late Penalties */}
      {(invoice.notes || invoice.terms || invoice.latePenalty) && (
        <div
          style={{ borderTop: '1px solid #e5e7eb', color: '#6b7280' }}
          className="grid grid-cols-2 gap-8 text-xs absolute bottom-12 w-[calc(100%-6rem)] pt-6"
        >
          {invoice.notes && (
            <div>
              <p style={{ color: '#111827' }} className="font-bold mb-1 uppercase tracking-wider">
                Notes
              </p>
              <p className="leading-relaxed">{invoice.notes}</p>
            </div>
          )}
          {(invoice.terms || invoice.latePenalty) && (
            <div>
              {invoice.terms && (
                <div className="mb-2">
                  <p style={{ color: '#111827' }} className="font-bold mb-0.5 uppercase tracking-wider">
                    Payment Terms
                  </p>
                  <p className="leading-relaxed">{invoice.terms}</p>
                </div>
              )}
              {invoice.latePenalty && (
                <div>
                  <p style={{ color: '#dc2626' }} className="font-bold mb-0.5 uppercase tracking-wider">
                    Late Penalty
                  </p>
                  <p style={{ color: '#dc2626' }} className="leading-relaxed">
                    {invoice.latePenalty}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
