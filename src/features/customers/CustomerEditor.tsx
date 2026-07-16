import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomerPayloadSchema, CustomerPayload, Customer } from '@/domain/customer';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Button } from '@/shared/components/Button';

interface CustomerEditorProps {
  initialData?: Customer;
  onSubmit: (data: CustomerPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CustomerEditor: React.FC<CustomerEditorProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerPayload>({
    resolver: zodResolver(CustomerPayloadSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      notes: initialData?.notes || '',
    },
  });

  const submitting = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" placeholder="Acme Corp" {...register('name')} error={errors.name?.message} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="contact@acme.com" {...register('email')} error={errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" placeholder="+1 555 123 4567" {...register('phone')} error={errors.phone?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="123 Business St, City" {...register('address')} error={errors.address?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" placeholder="Additional details..." {...register('notes')} error={errors.notes?.message} />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={submitting}>
          {initialData ? 'Save Changes' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
};
