import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FullInvoicePayloadSchema, FullInvoicePayload } from '@/domain/invoice';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { calculateInvoiceTotals } from './utils/calculations';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Button } from '@/shared/components/Button';
import { Select } from '@/shared/components/Select';
import { Typography } from '@/shared/components/Typography';
import { Trash2, Plus } from 'lucide-react';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut';

interface InvoiceBuilderProps {
  onSubmit: (data: FullInvoicePayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ onSubmit, onCancel, isLoading }) => {
  const { customers, loadCustomers } = useCustomerStore();
  const [customerOptions, setCustomerOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    setCustomerOptions(customers.map(c => ({ label: c.name, value: c.id })));
  }, [customers]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FullInvoicePayload>({
    resolver: zodResolver(FullInvoicePayloadSchema),
    defaultValues: {
      invoice: {
        customerId: '',
        invoiceNumber: `INV-${Date.now()}`,
        status: 'Draft',
        issueDate: Date.now(),
        dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // +30 days
        taxRate: 0,
        notes: '',
        terms: 'Net 30',
      },
      items: [
        { description: '', quantity: 1, unitPrice: 0 }
      ]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchTaxRate = watch('invoice.taxRate');

  const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(watchItems || [], watchTaxRate || 0);

  const submitting = isLoading || isSubmitting;

  const onSave = async (data: FullInvoicePayload) => {
    await onSubmit(data);
  };

  // CMD+S shortcut to save as Draft/Current Status
  useKeyboardShortcut({ key: 's', ctrlOrCmd: true }, () => {
    if (Object.keys(errors).length === 0) {
      handleSubmit(onSave)();
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface border border-border-subtle rounded-xl shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Customer *</Label>
            <Select 
              {...register('invoice.customerId')} 
              options={customerOptions}
              error={errors.invoice?.customerId?.message}
            />
          </div>
          <div className="space-y-2">
            <Label>Invoice Number *</Label>
            <Input {...register('invoice.invoiceNumber')} error={errors.invoice?.invoiceNumber?.message} />
          </div>
        </div>
        <div className="space-y-4">
           <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              {...register('invoice.status')} 
              options={[
                { label: 'Draft', value: 'Draft' },
                { label: 'Sent', value: 'Sent' },
                { label: 'Paid', value: 'Paid' }
              ]}
              error={errors.invoice?.status?.message}
            />
          </div>
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input type="number" step="0.1" {...register('invoice.taxRate', { valueAsNumber: true })} error={errors.invoice?.taxRate?.message} />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="p-6 bg-surface border border-border-subtle rounded-xl shadow-sm space-y-4">
        <Typography variant="h3">Line Items</Typography>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start pb-4 border-b border-border-subtle">
            <div className="flex-1 space-y-2">
              <Label>Description</Label>
              <Input placeholder="Service description" {...register(`items.${index}.description`)} error={errors.items?.[index]?.description?.message} />
            </div>
            <div className="w-24 space-y-2">
              <Label>Qty</Label>
              <Input type="number" step="any" {...register(`items.${index}.quantity`, { valueAsNumber: true })} error={errors.items?.[index]?.quantity?.message} />
            </div>
            <div className="w-32 space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} error={errors.items?.[index]?.unitPrice?.message} />
            </div>
            <div className="pt-8">
              <Button type="button" variant="ghost" className="text-danger hover:text-danger hover:bg-danger/10" onClick={() => remove(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {errors.items?.root && <p className="text-sm text-danger">{errors.items.root.message}</p>}
        <Button type="button" variant="secondary" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {/* Totals & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-6 bg-surface border border-border-subtle rounded-xl shadow-sm">
           <div className="space-y-2">
            <Label>Notes</Label>
            <Input placeholder="Thank you for your business..." {...register('invoice.notes')} />
          </div>
          <div className="space-y-2">
            <Label>Terms</Label>
            <Input placeholder="Net 30" {...register('invoice.terms')} />
          </div>
        </div>

        <div className="p-6 bg-muted rounded-xl border border-border-subtle flex flex-col justify-end space-y-2 text-right">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax ({watchTaxRate || 0}%):</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-foreground pt-4 border-t border-border-subtle">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={handleSubmit(onSave)}>
            Save Draft <span className="ml-2 text-xs opacity-50 font-normal border border-border-subtle px-1.5 rounded bg-muted/50">⌘ S</span>
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit((data) => {
            setValue('invoice.status', 'Sent');
            onSave({ ...data, invoice: { ...data.invoice, status: 'Sent' } });
          })}>
            Save & Mark as Sent
          </Button>
        </div>
      </div>
    </form>
  );
};
