import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useInvoiceStore } from './store/invoice.store';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { InvoiceBuilder } from './InvoiceBuilder';
import { InvoiceDetails } from './InvoiceDetails';
import { FullInvoicePayload } from '@/domain/invoice';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { motion } from 'framer-motion';

const InvoiceList = lazy(() => import('./InvoiceList').then(m => ({ default: m.InvoiceList })));

type ViewState = 'list' | 'builder' | 'details';

export const InvoicesPage: React.FC = () => {
  const { invoices, loadInvoices, loadInvoice, createInvoice, isLoading } = useInvoiceStore();
  const { customers, loadCustomers } = useCustomerStore();
  const { loadSettings } = useSettingsStore();
  const [viewState, setViewState] = useState<ViewState>('list');

  useEffect(() => {
    loadInvoices();
    loadCustomers();
    loadSettings();
  }, [loadInvoices, loadCustomers, loadSettings]);

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
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6"
      >
        <Typography variant="h1">Create Invoice</Typography>
        <InvoiceBuilder 
          onSubmit={handleBuilderSubmit}
          onCancel={handleBackToList}
          isLoading={isLoading}
        />
      </motion.div>
    );
  }

  if (viewState === 'details') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="p-4 sm:p-8"
      >
        <InvoiceDetails onBack={handleBackToList} />
      </motion.div>
    );
  }

  // Empty state if NO customers exist (can't create an invoice)
  if (!isLoading && customers.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="p-4 sm:p-8 flex flex-col justify-center items-center h-[80vh] text-center space-y-6"
      >
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
      </motion.div>
    );
  }

  // Empty state if no invoices exist
  if (!isLoading && invoices.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="p-4 sm:p-8 flex flex-col justify-center items-center h-[80vh] text-center space-y-6"
      >
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
      </motion.div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 pb-0 sm:pb-0 max-w-7xl w-full mx-auto min-h-0">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-shrink-0 flex justify-between items-center pb-4 sm:pb-6 sticky top-0 z-10 bg-muted"
      >
        <Typography variant="h1">Invoices</Typography>
        <Button variant="primary" onClick={handleCreateNew} disabled={isLoading}>
          Create Invoice
        </Button>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        className="flex-1 min-h-0 flex flex-col pb-1"
      >
        <PageSkeleton loading={isLoading} className="flex-1 min-h-0 flex flex-col pb-1">
          <Suspense fallback={null}>
            <InvoiceList invoices={invoices} onSelect={handleSelectInvoice} isLoading={isLoading} />
          </Suspense>
        </PageSkeleton>
      </motion.div>
    </div>
  );
};
