import React from 'react';
import { useInvoiceStore } from './store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { FileDown, ArrowLeft, Send, CheckCircle, Trash2 } from 'lucide-react';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { StandardTemplate } from '@/features/invoice-templates/StandardTemplate';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { useEffect, useState } from 'react';

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
  const customer = customers.find(c => c.id === invoice.customerId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Invoices
        </Button>
        <div className="flex gap-2">
           <Button 
             variant="ghost" 
             onClick={async () => {
               if (!customer) return;
               setIsGenerating(true);
               try {
                 await generateInvoicePDF(invoice.invoiceNumber, `pdf-template-${invoice.id}`);
               } finally {
                 setIsGenerating(false);
               }
             }}
             isLoading={isGenerating}
           >
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
           <Button variant="danger" onClick={async () => {
             if (window.confirm('Delete this invoice forever?')) {
               await deleteInvoice(invoice.id);
               onBack();
             }
           }}>
             <Trash2 className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* Invoice Document Preview (Web View) */}
      <div className="bg-surface p-12 rounded-xl shadow-sm border border-border-subtle space-y-12">
        <div className="flex justify-between items-start">
          <div>
            <Typography variant="h1" className="text-4xl">INVOICE</Typography>
            <Typography variant="body" className="text-muted-foreground mt-2">{invoice.invoiceNumber}</Typography>
          </div>
          <div className="text-right">
             <Typography variant="h3" className="font-bold">Total Due</Typography>
             <Typography variant="h2" className="text-primary mt-1">${invoice.totalAmount.toFixed(2)}</Typography>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
           <div>
             <Typography variant="caption" className="font-bold uppercase tracking-wider mb-2 block">Bill To</Typography>
             <Typography variant="body" className="font-medium">{customer?.name || 'Unknown'}</Typography>
             <Typography variant="body" className="text-muted-foreground whitespace-pre-wrap">{customer?.address}</Typography>
           </div>
           <div className="grid grid-cols-2 gap-4 text-right">
              <div>
                <Typography variant="caption" className="font-bold uppercase tracking-wider">Issue Date</Typography>
                <Typography variant="body">{new Date(invoice.issueDate).toLocaleDateString()}</Typography>
              </div>
              <div>
                <Typography variant="caption" className="font-bold uppercase tracking-wider">Due Date</Typography>
                <Typography variant="body">{new Date(invoice.dueDate).toLocaleDateString()}</Typography>
              </div>
           </div>
        </div>

        <div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-border-subtle">
                <th className="py-3 font-semibold text-muted-foreground">Description</th>
                <th className="py-3 font-semibold text-muted-foreground text-center">Qty</th>
                <th className="py-3 font-semibold text-muted-foreground text-right">Price</th>
                <th className="py-3 font-semibold text-muted-foreground text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-border-subtle/50">
                  <td className="py-4">{item.description}</td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 text-right font-medium">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
           <div className="w-64 space-y-3">
             <div className="flex justify-between text-muted-foreground">
               <span>Subtotal</span>
               <span>${invoice.subtotal.toFixed(2)}</span>
             </div>
             {invoice.taxRate > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span>${invoice.taxAmount.toFixed(2)}</span>
                </div>
             )}
             <div className="flex justify-between text-xl font-bold border-t border-border-subtle pt-3">
               <span>Total</span>
               <span>${invoice.totalAmount.toFixed(2)}</span>
             </div>
           </div>
        </div>

        {(invoice.notes || invoice.terms) && (
          <div className="border-t border-border-subtle pt-8 grid grid-cols-2 gap-8 text-sm text-muted-foreground">
             {invoice.notes && (
               <div>
                 <p className="font-semibold text-foreground mb-1">Notes</p>
                 <p>{invoice.notes}</p>
               </div>
             )}
             {invoice.terms && (
               <div>
                 <p className="font-semibold text-foreground mb-1">Terms</p>
                 <p>{invoice.terms}</p>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Hidden PDF Template Container */}
      <div className="overflow-hidden h-0 w-0 absolute opacity-0 pointer-events-none">
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
