import React, { useEffect, useState } from 'react';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useCustomerStore } from './store/customer.store';
import { CustomerList } from './CustomerList';
import { CustomerEditor } from './CustomerEditor';
import { Customer, CustomerPayload } from '@/domain/customer';
import { Users } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, loadCustomers, createCustomer, updateCustomer, deleteCustomer, isLoading } = useCustomerStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();

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

  if (isLoading && customers.length === 0) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Typography variant="body" className="text-muted-foreground animate-pulse">Loading customers...</Typography>
      </div>
    );
  }

  // --- EDITOR VIEW ---
  if (isEditorOpen) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h1">{editingCustomer ? 'Edit Customer' : 'New Customer'}</Typography>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-border-subtle">
          <CustomerEditor
            key={editingCustomer?.id || 'new'}
            initialData={editingCustomer}
            onSubmit={handleSubmit}
            onCancel={() => setIsEditorOpen(false)}
          />
        </div>
        
        {editingCustomer && (
          <div className="mt-8 pt-8 border-t border-border-subtle flex justify-end">
             <Button variant="danger" onClick={async () => {
                if (window.confirm('Are you sure you want to delete this customer?')) {
                  await deleteCustomer(editingCustomer.id);
                  setIsEditorOpen(false);
                }
             }}>
               Delete Customer
             </Button>
          </div>
        )}
      </div>
    );
  }

  // --- EMPTY STATE VIEW ---
  if (customers.length === 0) {
    return (
      <div className="p-8 flex flex-col justify-center items-center h-[80vh] text-center space-y-6">
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
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Typography variant="h1">Customers</Typography>
        <Button variant="primary" onClick={handleCreateNew}>
          Add Customer
        </Button>
      </div>
      
      <CustomerList customers={customers} onSelect={handleEdit} />
    </div>
  );
};
