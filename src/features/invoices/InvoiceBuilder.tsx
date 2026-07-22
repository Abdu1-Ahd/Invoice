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
import { CurrencySelect } from '@/shared/components/CurrencySelect';
import { Typography } from '@/shared/components/Typography';
import { Trash2, Plus } from 'lucide-react';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut';

interface InvoiceBuilderProps {
  onSubmit: (data: FullInvoicePayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const formatDateForInput = (timestamp: number) => {
  const d = new Date(timestamp || Date.now());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseInputDate = (dateStr: string) => {
  if (!dateStr) return Date.now();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
};

export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ onSubmit, onCancel, isLoading }) => {
  const { customers, loadCustomers } = useCustomerStore();
  const { settings, loadSettings } = useSettingsStore();
  const [customerOptions, setCustomerOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    loadCustomers();
    loadSettings();
  }, [loadCustomers, loadSettings]);

  useEffect(() => {
    setCustomerOptions(customers.map((c) => ({ label: c.name, value: c.id })));
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
        billingAddress: '',
        paymentMethod: 'Bank Transfer',
        latePenalty: '1.5% per month after due date',
        billingCycle: 'One-Time',
        currency: '',
        discount: { type: 'percentage', value: 0 },
      },
      items: [{ description: '', subDescription: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchTaxRate = watch('invoice.taxRate');
  const watchDiscount = watch('invoice.discount');
  const watchCurrency = watch('invoice.currency') || settings?.currency || 'PKR';
  const watchCustomerId = watch('invoice.customerId');
  const watchIssueDate = watch('invoice.issueDate');
  const watchDueDate = watch('invoice.dueDate');
  const watchTerms = watch('invoice.terms');

  // Auto populate customer billing address if customer changes and address is empty
  useEffect(() => {
    if (watchCustomerId) {
      const cust = customers.find((c) => c.id === watchCustomerId);
      if (cust && cust.address) {
        setValue('invoice.billingAddress', cust.address);
      }
    }
  }, [watchCustomerId, customers, setValue]);

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

  // Handle Terms Select change -> auto compute Due Date
  const handleTermsChange = (newTerm: string) => {
    setValue('invoice.terms', newTerm);
    const baseIssueDate = watchIssueDate || Date.now();
    let daysToAdd = 30;

    if (newTerm === 'Due on Receipt') daysToAdd = 0;
    else if (newTerm === 'Net 7') daysToAdd = 7;
    else if (newTerm === 'Net 15') daysToAdd = 15;
    else if (newTerm === 'Net 30') daysToAdd = 30;
    else if (newTerm === 'Net 60') daysToAdd = 60;
    else if (newTerm === 'Net 90') daysToAdd = 90;
    else return; // Custom term, don't overwrite due date

    setValue('invoice.dueDate', baseIssueDate + daysToAdd * 86400000);
  };

  // Handle Manual Issue Date change -> update Due date if preset terms exist
  const handleIssueDateChange = (dateStr: string) => {
    const newTimestamp = parseInputDate(dateStr);
    setValue('invoice.issueDate', newTimestamp);

    if (watchTerms === 'Due on Receipt') setValue('invoice.dueDate', newTimestamp);
    else if (watchTerms === 'Net 7') setValue('invoice.dueDate', newTimestamp + 7 * 86400000);
    else if (watchTerms === 'Net 15') setValue('invoice.dueDate', newTimestamp + 15 * 86400000);
    else if (watchTerms === 'Net 30') setValue('invoice.dueDate', newTimestamp + 30 * 86400000);
    else if (watchTerms === 'Net 60') setValue('invoice.dueDate', newTimestamp + 60 * 86400000);
    else if (watchTerms === 'Net 90') setValue('invoice.dueDate', newTimestamp + 90 * 86400000);
  };

  // Handle Manual Due Date change -> auto update Terms field
  const handleDueDateChange = (dateStr: string) => {
    const newDueDate = parseInputDate(dateStr);
    setValue('invoice.dueDate', newDueDate);

    const baseIssue = watchIssueDate || Date.now();
    const diffDays = Math.round((newDueDate - baseIssue) / 86400000);

    if (diffDays === 0) setValue('invoice.terms', 'Due on Receipt');
    else if (diffDays === 7) setValue('invoice.terms', 'Net 7');
    else if (diffDays === 15) setValue('invoice.terms', 'Net 15');
    else if (diffDays === 30) setValue('invoice.terms', 'Net 30');
    else if (diffDays === 60) setValue('invoice.terms', 'Net 60');
    else if (diffDays === 90) setValue('invoice.terms', 'Net 90');
    else if (diffDays > 0) setValue('invoice.terms', `Net ${diffDays}`);
    else setValue('invoice.terms', 'Custom');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-16">
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
            <Label>Billing Address</Label>
            <textarea
              className="w-full text-sm p-2.5 border border-input rounded-md bg-surface text-text-primary focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="Customer Billing Address"
              rows={2}
              {...register('invoice.billingAddress')}
            />
          </div>

          <div className="space-y-2">
            <Label>Invoice Number *</Label>
            <Input {...register('invoice.invoiceNumber')} error={errors.invoice?.invoiceNumber?.message} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                {...register('invoice.status')}
                options={[
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Sent', value: 'Sent' },
                  { label: 'Paid', value: 'Paid' },
                ]}
                error={errors.invoice?.status?.message}
              />
            </div>
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
          </div>

          {/* Dates & Net Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={formatDateForInput(watchIssueDate)}
                onChange={(e) => handleIssueDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select
                value={watchTerms || 'Net 30'}
                onChange={(e) => handleTermsChange(e.target.value)}
                options={[
                  { label: 'Due on Receipt', value: 'Due on Receipt' },
                  { label: 'Net 7', value: 'Net 7' },
                  { label: 'Net 15', value: 'Net 15' },
                  { label: 'Net 30', value: 'Net 30' },
                  { label: 'Net 60', value: 'Net 60' },
                  { label: 'Net 90', value: 'Net 90' },
                  { label: 'Custom', value: 'Custom' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formatDateForInput(watchDueDate)}
                onChange={(e) => handleDueDateChange(e.target.value)}
              />
            </div>
          </div>

          {/* Currency & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <CurrencySelect
                value={watchCurrency}
                onChange={(val) => setValue('invoice.currency', val, { shouldDirty: true })}
                error={errors.invoice?.currency?.message}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                {...register('invoice.paymentMethod')}
                options={[
                  { label: 'Bank Transfer', value: 'Bank Transfer' },
                  { label: 'Credit Card', value: 'Credit Card' },
                  { label: 'Cash', value: 'Cash' },
                  { label: 'PayPal', value: 'PayPal' },
                  { label: 'Cheque', value: 'Cheque' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="p-6 bg-surface border border-border rounded-xl shadow-sm space-y-4">
        <Typography variant="h3">Line Items</Typography>
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border border-border rounded-lg bg-background space-y-3">
            {/* Top row: Description, Qty, Price, Delete button */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <div className="sm:col-span-6 space-y-1">
                <Label>Description *</Label>
                <Input
                  placeholder="Service description"
                  {...register(`items.${index}.description`)}
                  error={errors.items?.[index]?.description?.message}
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>Qty *</Label>
                <Input
                  type="number"
                  step="any"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  error={errors.items?.[index]?.quantity?.message}
                />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <Label>Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  error={errors.items?.[index]?.unitPrice?.message}
                />
              </div>
              <div className="sm:col-span-1 flex justify-end sm:pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-danger hover:text-danger hover:bg-danger/10 p-2 h-10 w-10"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Subdescription spanning full line underneath */}
            <div className="space-y-1 w-full pt-1">
              <Label className="text-xs text-text-muted">Sub-description (optional)</Label>
              <textarea
                className="w-full text-sm p-2.5 border border-input rounded-md bg-surface text-text-primary focus:ring-2 focus:ring-ring focus:outline-none transition-all resize-y min-h-[44px] overflow-hidden"
                placeholder="Detailed scope, item breakdown, or notes..."
                rows={2}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.max(44, target.scrollHeight)}px`;
                }}
                {...register(`items.${index}.subDescription`)}
              />
            </div>
          </div>
        ))}
        {errors.items?.root && <p className="text-sm text-danger">{errors.items.root.message}</p>}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ description: '', subDescription: '', quantity: 1, unitPrice: 0 })}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {/* Totals, Penalties & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-6 bg-surface border border-border rounded-xl shadow-sm">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input placeholder="Thank you for your business..." {...register('invoice.notes')} />
          </div>
          <div className="space-y-2">
            <Label>Late Penalty Terms</Label>
            <Input
              placeholder="e.g. 1.5% per month after due date"
              {...register('invoice.latePenalty')}
            />
          </div>
        </div>

        <div className="p-6 bg-muted rounded-xl border border-border flex flex-col justify-end space-y-3 text-right">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
            <div className="space-y-2 text-left">
              <Label>Discount Type</Label>
              <Select
                {...register('invoice.discount.type')}
                options={[
                  { label: 'Percentage (%)', value: 'percentage' },
                  { label: 'Fixed Amount', value: 'fixed' },
                ]}
              />
            </div>
            <div className="space-y-2 text-left">
              <Label>Discount Value</Label>
              <Input type="number" step="any" {...register('invoice.discount.value', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-2 text-left">
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              {...register('invoice.taxRate', { valueAsNumber: true })}
              error={errors.invoice?.taxRate?.message}
            />
          </div>

          <div className="flex justify-between text-text-muted mt-4">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal, watchCurrency)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-danger font-medium">
              <span>Discount ({watchDiscount?.type === 'percentage' ? `${watchDiscount.value}%` : 'Fixed'}):</span>
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

      {/* Responsive Footer Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting} className="w-full sm:w-auto">
          Cancel
        </Button>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit(onSave)}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Save Draft{' '}
            <span className="ml-2 text-xs opacity-50 font-normal border border-border-subtle px-1.5 rounded bg-muted/50 hidden sm:inline-block">
              ⌘ S
            </span>
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit((data) => {
              setValue('invoice.status', 'Sent');
              onSave({ ...data, invoice: { ...data.invoice, status: 'Sent' } });
            })}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Save & Mark as Sent
          </Button>
        </div>
      </div>
    </form>
  );
};
