import React, { useEffect, useState } from 'react';
import { useInvoiceStore } from './store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { FileDown, ArrowLeft, Send, CheckCircle, Trash2 } from 'lucide-react';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { StandardTemplate } from '@/features/invoice-templates/StandardTemplate';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { formatCurrency } from '@/core/utils/currency';

interface InvoiceDetailsProps {
  onBack: () => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ onBack }) => {
  const { activeInvoice, updateInvoiceStatus, deleteInvoice, isLoading } = useInvoiceStore();
  const { customers } = useCustomerStore();
  const { settings, loadSettings } = useSettingsStore();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (isLoading || !activeInvoice || !settings) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Typography variant="body" className="animate-pulse">Loading invoice...</Typography>
      </div>
    );
  }

  const { invoice, items } = activeInvoice;
  const customer = customers.find((c) => c.id === invoice.customerId);
  const currencyCode = invoice.currency || settings.currency || 'PKR';
  const billingAddr = invoice.billingAddress || customer?.address || customer?.email;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await generateInvoicePDF(invoice.invoiceNumber, `pdf-template-${invoice.id}`);
    } catch (err) {
      console.error('PDF Download failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="text-text-muted self-start">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Invoices
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={handleDownloadPDF} isLoading={isGenerating}>
            <FileDown className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          {invoice.status === 'Draft' && (
            <Button variant="secondary" onClick={() => updateInvoiceStatus(invoice.id, 'Sent')}>
              <Send className="w-4 h-4 mr-2" /> Mark as Sent
            </Button>
          )}
          {invoice.status === 'Sent' && (
            <Button variant="primary" onClick={() => updateInvoiceStatus(invoice.id, 'Paid')}>
              <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
            </Button>
          )}
          <Button
            variant="danger"
            onClick={async () => {
              if (window.confirm('Delete this invoice forever?')) {
                await deleteInvoice(invoice.id);
                onBack();
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Invoice Document Preview (Web View) */}
      <div className="bg-surface p-6 sm:p-12 rounded-xl shadow-sm border border-border space-y-8 sm:space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <Typography variant="h1" className="text-3xl sm:text-4xl">
              INVOICE
            </Typography>
            <Typography variant="body" className="text-text-muted mt-1">
              {invoice.invoiceNumber}
            </Typography>
            {invoice.billingCycle && invoice.billingCycle !== 'One-Time' && (
              <span className="inline-block mt-2 px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-full">
                {invoice.billingCycle}
              </span>
            )}
          </div>
          <div className="text-left sm:text-right">
            <Typography variant="h3" className="font-bold">
              Total Due
            </Typography>
            <Typography variant="h2" className="text-primary mt-1">
              {formatCurrency(invoice.totalAmount, currencyCode)}
            </Typography>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <Typography variant="caption" className="font-bold uppercase tracking-wider mb-2 block">
              Bill To
            </Typography>
            <Typography variant="body" className="font-medium text-lg">
              {customer?.name || 'Unknown'}
            </Typography>
            <Typography variant="body" className="text-text-muted whitespace-pre-wrap mt-1">
              {billingAddr}
            </Typography>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:text-right">
            <div>
              <Typography variant="caption" className="font-bold uppercase tracking-wider">
                Issue Date
              </Typography>
              <Typography variant="body" className="font-semibold">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </Typography>
            </div>
            <div>
              <Typography variant="caption" className="font-bold uppercase tracking-wider">
                Due Date
              </Typography>
              <Typography variant="body" className="font-semibold">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </Typography>
            </div>
            {invoice.paymentMethod && (
              <div className="col-span-2">
                <Typography variant="caption" className="font-bold uppercase tracking-wider">
                  Payment Method
                </Typography>
                <Typography variant="body">{invoice.paymentMethod}</Typography>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="py-3 font-semibold text-text-muted">Description</th>
                <th className="py-3 font-semibold text-text-muted text-center">Qty</th>
                <th className="py-3 font-semibold text-text-muted text-right">Price</th>
                <th className="py-3 font-semibold text-text-muted text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="py-4">
                    <p className="font-medium">{item.description}</p>
                    {item.subDescription && (
                      <p className="text-sm text-text-muted mt-1 whitespace-pre-wrap">{item.subDescription}</p>
                    )}
                  </td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">{formatCurrency(item.unitPrice, currencyCode)}</td>
                  <td className="py-4 text-right font-medium">{formatCurrency(item.total, currencyCode)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full sm:w-80 space-y-3">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal, currencyCode)}</span>
            </div>
            {(invoice.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between text-danger font-medium">
                <span>
                  Discount {invoice.discount?.type === 'percentage' ? `(${invoice.discount.value}%)` : ''}
                </span>
                <span>-{formatCurrency(invoice.discountAmount!, currencyCode)}</span>
              </div>
            )}
            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-text-muted">
                <span>Tax ({invoice.taxRate}%)</span>
                <span>{formatCurrency(invoice.taxAmount, currencyCode)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
              <span>Total</span>
              <span>{formatCurrency(invoice.totalAmount, currencyCode)}</span>
            </div>
          </div>
        </div>

        {(invoice.notes || invoice.terms || invoice.latePenalty) && (
          <div className="border-t border-border pt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm text-text-muted">
            {invoice.notes && (
              <div>
                <p className="font-semibold text-text-primary mb-1">Notes</p>
                <p className="whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {(invoice.terms || invoice.latePenalty) && (
              <div>
                {invoice.terms && (
                  <div className="mb-3">
                    <p className="font-semibold text-text-primary mb-1">Payment Terms</p>
                    <p>{invoice.terms}</p>
                  </div>
                )}
                {invoice.latePenalty && (
                  <div>
                    <p className="font-semibold text-danger mb-1">Late Penalty</p>
                    <p className="text-danger/90">{invoice.latePenalty}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden PDF Template Container (Positioned Off-Screen with fixed width so html2canvas captures full 800px PDF) */}
      <div className="fixed top-0 left-[-9999px] z-[-1] pointer-events-none">
        {customer && (
          <StandardTemplate
            id={`pdf-template-${invoice.id}`}
            invoice={invoice}
            items={items}
            customer={customer}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
};
