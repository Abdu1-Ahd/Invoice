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
  id
}) => {
  const currencyCode = invoice.currency || settings.currency || 'PKR';

  return (
    <div id={id} className="bg-surface text-text-primary p-12 w-[800px] min-h-[1131px] mx-auto relative font-sans">
      <div className="flex justify-between items-start mb-12">
        <div>
          {settings.logoBase64 ? (
            <img src={settings.logoBase64} alt="Agency Logo" className="h-16 object-contain mb-4" />
          ) : (
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-4">{settings.agencyName || 'Your Agency Name'}</h2>
          )}
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-black text-text-primary tracking-tighter uppercase">INVOICE</h1>
          <p className="text-xl text-text-muted font-medium mt-1">{invoice.invoiceNumber}</p>
          {invoice.billingCycle && invoice.billingCycle !== 'One-Time' && (
            <span className="inline-block mt-2 px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-full">
              {invoice.billingCycle}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To</h3>
          <p className="font-bold text-lg text-gray-800">{customer.name}</p>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed mt-1">{customer.address || customer.email}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-right">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Issue Date</h3>
            <p className="font-semibold text-gray-800">{new Date(invoice.issueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Due Date</h3>
            <p className="font-semibold text-gray-800">{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider w-1/2">Description</th>
            <th className="py-3 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">Qty</th>
            <th className="py-3 text-right text-sm font-bold text-gray-900 uppercase tracking-wider">Rate</th>
            <th className="py-3 text-right text-sm font-bold text-gray-900 uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} className={`border-b ${i === items.length - 1 ? 'border-primary' : 'border-border'}`}>
              <td className="py-4 text-text-primary">
                <p className="font-medium">{item.description}</p>
                {item.subDescription && (
                  <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{item.subDescription}</p>
                )}
              </td>
              <td className="py-4 text-center text-text-primary">{item.quantity}</td>
              <td className="py-4 text-right text-text-primary">{formatCurrency(item.unitPrice, currencyCode)}</td>
              <td className="py-4 text-right font-medium text-text-primary">{formatCurrency(item.total, currencyCode)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-16">
        <div className="w-80 space-y-3">
          <div className="flex justify-between text-text-secondary px-4">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(invoice.subtotal, currencyCode)}</span>
          </div>
          {(invoice.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-danger px-4">
              <span>Discount</span>
              <span className="font-medium">-{formatCurrency(invoice.discountAmount!, currencyCode)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="flex justify-between text-text-secondary px-4">
              <span>Tax ({invoice.taxRate}%)</span>
              <span className="font-medium">{formatCurrency(invoice.taxAmount, currencyCode)}</span>
            </div>
          )}
          <div className="mt-4 p-4 bg-primary text-primary-foreground rounded-xl flex justify-between items-center shadow-md">
            <span className="font-bold uppercase tracking-wider text-sm opacity-90">Total Due</span>
            <span className="font-black text-2xl">{formatCurrency(invoice.totalAmount, currencyCode)}</span>
          </div>
        </div>
      </div>

      {(invoice.notes || invoice.terms) && (
        <div className="grid grid-cols-2 gap-8 text-sm text-gray-500 absolute bottom-12 w-[calc(100%-6rem)]">
          {invoice.notes && (
            <div>
              <p className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-xs">Notes</p>
              <p className="leading-relaxed">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-xs">Terms</p>
              <p className="leading-relaxed">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
