import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useCustomerStore } from './store/customer.store';
import { CustomerEditor } from './CustomerEditor';
import { Customer, CustomerPayload } from '@/domain/customer';
import { Users } from 'lucide-react';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { PageSkeleton } from '@/shared/components/PageSkeleton';

const CustomerList = lazy(() => import('./CustomerList').then(m => ({ default: m.CustomerList })));

export const CustomersPage: React.FC = () => {
  const { customers, loadCustomers, createCustomer, updateCustomer, deleteCustomer, isLoading } = useCustomerStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [customerToDelete, setCustomerToDelete] = useState<Customer | undefined>();

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreateNew = () => {
    setEditingCustomer(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditorOpen(true);
  };

  const handleSubmit = async (payload: CustomerPayload) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, payload);
    } else {
      await createCustomer(payload);
    }
    setIsEditorOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete.id);
      setCustomerToDelete(undefined);
      setIsEditorOpen(false);
    }
  };

  // --- EDITOR VIEW ---
  if (isEditorOpen) {
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h1">{editingCustomer ? 'Edit Customer' : 'New Customer'}</Typography>
        </div>
        <PageSkeleton loading={isLoading}>
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-border-subtle">
            <CustomerEditor
              key={editingCustomer?.id || 'new'}
              initialData={editingCustomer}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditorOpen(false)}
              isLoading={isLoading}
            />
          </div>
        </PageSkeleton>
        
        {editingCustomer && (
          <div className="mt-8 pt-8 border-t border-border-subtle flex justify-end">
             <Button variant="danger" onClick={() => setCustomerToDelete(editingCustomer)}>
               Delete Customer
             </Button>
          </div>
        )}

        <ConfirmModal
          isOpen={!!customerToDelete}
          title="Delete Customer?"
          message={`Are you sure you want to permanently delete customer "${customerToDelete?.name || ''}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setCustomerToDelete(undefined)}
        />
      </div>
    );
  }

  // --- EMPTY STATE VIEW ---
  if (!isLoading && customers.length === 0) {
    return (
      <div className="p-4 sm:p-8 flex flex-col justify-center items-center h-[80vh] text-center space-y-6">
        <div className="bg-muted p-6 rounded-full inline-flex">
          <Users className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="max-w-md">
          <Typography variant="h2" className="mb-2">Let's add your first customer.</Typography>
          <Typography variant="body" className="text-muted-foreground mb-8">
            Customers are the heart of your business. Add one to start generating invoices.
          </Typography>
          <Button variant="primary" size="lg" onClick={handleCreateNew}>
            Add Customer
          </Button>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 pb-0 sm:pb-0 max-w-7xl w-full mx-auto min-h-0">
      <PageSkeleton loading={isLoading} className="flex-1 min-h-0 flex flex-col">
        <div className="flex-shrink-0 flex justify-between items-center pb-4 sm:pb-6 sticky top-0 z-10 bg-muted">
          <Typography variant="h1">Customers</Typography>
          <Button variant="primary" onClick={handleCreateNew} disabled={isLoading}>
            Add Customer
          </Button>
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col pb-1">
          <Suspense fallback={<div className="p-8 text-center text-text-muted text-sm">Loading list...</div>}>
            <CustomerList customers={customers} onSelect={handleEdit} isLoading={isLoading} />
          </Suspense>
        </div>
      </PageSkeleton>
    </div>
  );
};
