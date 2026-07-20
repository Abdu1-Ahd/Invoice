import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FullInvoicePayloadSchema, FullInvoicePayload } from '@/domain/invoice';
import { useCustomerStore } from '@/features/customers/store/customer.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { calculateInvoiceTotals } from './utils/calculations';
import { formatCurrency } from '@/core/utils/currency';
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
  const { settings, loadSettings } = useSettingsStore();
  const [customerOptions, setCustomerOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    loadCustomers();
    loadSettings();
  }, [loadCustomers, loadSettings]);

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
        billingCycle: 'One-Time',
        currency: '', // Will fall back to settings
        discount: { type: 'percentage', value: 0 },
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
  const watchDiscount = watch('invoice.discount');
  const watchCurrency = watch('invoice.currency') || settings?.currency || 'PKR';

  const { subtotal, discountAmount, taxAmount, totalAmount } = calculateInvoiceTotals(
    watchItems || [], 
    watchTaxRate || 0,
    watchDiscount
  );

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface border border-border rounded-xl shadow-sm">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Billing Cycle</Label>
              <Select 
                {...register('invoice.billingCycle')} 
                options={[
                  { label: 'One-Time', value: 'One-Time' },
                  { label: 'Weekly', value: 'Weekly' },
                  { label: 'Bi-Weekly', value: 'Bi-Weekly' },
                  { label: 'Monthly', value: 'Monthly' },
                  { label: 'Quarterly', value: 'Quarterly' },
                  { label: 'Semi-Annual', value: 'Semi-Annual' },
                  { label: 'Annual', value: 'Annual' },
                  { label: 'Custom', value: 'Custom' },
                ]}
                error={errors.invoice?.billingCycle?.message}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input placeholder={settings?.currency || 'PKR'} {...register('invoice.currency')} error={errors.invoice?.currency?.message} />
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="p-6 bg-surface border border-border rounded-xl shadow-sm space-y-4">
        <Typography variant="h3">Line Items</Typography>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start pb-4 border-b border-border">
            <div className="flex-1 space-y-2">
              <Label>Description</Label>
              <Input placeholder="Service description" {...register(`items.${index}.description`)} error={errors.items?.[index]?.description?.message} />
              <textarea 
                className="w-full text-sm mt-2 p-2 border border-input rounded-md bg-background text-text-primary focus:ring-2 focus:ring-ring focus:outline-none" 
                placeholder="Sub-description (optional)" 
                rows={2}
                {...register(`items.${index}.subDescription`)}
              />
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
        <div className="space-y-4 p-6 bg-surface border border-border rounded-xl shadow-sm">
           <div className="space-y-2">
            <Label>Notes</Label>
            <Input placeholder="Thank you for your business..." {...register('invoice.notes')} />
          </div>
          <div className="space-y-2">
            <Label>Terms</Label>
            <Input placeholder="Net 30" {...register('invoice.terms')} />
          </div>
        </div>

        <div className="p-6 bg-muted rounded-xl border border-border flex flex-col justify-end space-y-3 text-right">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
            <div className="space-y-2 text-left">
               <Label>Discount Type</Label>
               <Select 
                 {...register('invoice.discount.type')} 
                 options={[{ label: 'Percentage (%)', value: 'percentage' }, { label: 'Fixed Amount', value: 'fixed' }]}
               />
            </div>
            <div className="space-y-2 text-left">
               <Label>Discount Value</Label>
               <Input type="number" step="any" {...register('invoice.discount.value', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-2 text-left">
             <Label>Tax Rate (%)</Label>
             <Input type="number" step="0.1" {...register('invoice.taxRate', { valueAsNumber: true })} error={errors.invoice?.taxRate?.message} />
          </div>

          <div className="flex justify-between text-text-muted mt-4">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal, watchCurrency)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-danger">
              <span>Discount:</span>
              <span>-{formatCurrency(discountAmount, watchCurrency)}</span>
            </div>
          )}
          <div className="flex justify-between text-text-muted">
            <span>Tax ({watchTaxRate || 0}%):</span>
            <span>{formatCurrency(taxAmount, watchCurrency)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-text-primary pt-4 border-t border-border">
            <span>Total:</span>
            <span>{formatCurrency(totalAmount, watchCurrency)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
