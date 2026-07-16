import React, { useEffect, useState } from 'react';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useInvoiceStore } from './store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { InvoiceList } from './InvoiceList';
import { InvoiceBuilder } from './InvoiceBuilder';
import { InvoiceDetails } from './InvoiceDetails';
import { FullInvoicePayload } from '@/domain/invoice';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

type ViewState = 'list' | 'builder' | 'details';

export const InvoicesPage: React.FC = () => {
  const { invoices, loadInvoices, loadInvoice, createInvoice, isLoading } = useInvoiceStore();
  const { customers, loadCustomers } = useCustomerStore();
  const [viewState, setViewState] = useState<ViewState>('list');

  useEffect(() => {
    loadInvoices();
    loadCustomers();
  }, [loadInvoices, loadCustomers]);

  const handleCreateNew = () => {
    setViewState('builder');
  };

  const handleSelectInvoice = async (id: string) => {
    await loadInvoice(id);
    setViewState('details');
  };

  const handleBuilderSubmit = async (payload: FullInvoicePayload) => {
    const newInvoice = await createInvoice(payload);
    await loadInvoice(newInvoice.id);
    setViewState('details');
  };

  const handleBackToList = () => {
    setViewState('list');
  };

  if (viewState === 'builder') {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Typography variant="h1">Create Invoice</Typography>
        <InvoiceBuilder 
          onSubmit={handleBuilderSubmit}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  if (viewState === 'details') {
    return (
      <div className="p-8">
        <InvoiceDetails onBack={handleBackToList} />
      </div>
    );
  }

  // Empty state if NO customers exist (can't create an invoice)
  if (!isLoading && customers.length === 0) {
    return (
      <div className="p-8 flex flex-col justify-center items-center h-[80vh] text-center space-y-6">
        <div className="bg-muted p-6 rounded-full inline-flex">
          <FileText className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="max-w-md">
          <Typography variant="h2" className="mb-2">You need a customer first.</Typography>
          <Typography variant="body" className="text-muted-foreground mb-8">
            Before creating an invoice, you need someone to bill it to.
          </Typography>
          <Link to="/customers" className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Go to Customers
          </Link>
        </div>
      </div>
    );
  }

  // Empty state if no invoices exist
  if (!isLoading && invoices.length === 0) {
    return (
      <div className="p-8 flex flex-col justify-center items-center h-[80vh] text-center space-y-6">
        <div className="bg-muted p-6 rounded-full inline-flex">
          <FileText className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="max-w-md">
          <Typography variant="h2" className="mb-2">Time to get paid.</Typography>
          <Typography variant="body" className="text-muted-foreground mb-8">
            Create your very first invoice and send it to a customer.
          </Typography>
          <Button variant="primary" size="lg" onClick={handleCreateNew}>
            Create Invoice
          </Button>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Typography variant="h1">Invoices</Typography>
        <Button variant="primary" onClick={handleCreateNew}>
          Create Invoice
        </Button>
      </div>
      
      <InvoiceList invoices={invoices} onSelect={handleSelectInvoice} />
    </div>
  );
};
