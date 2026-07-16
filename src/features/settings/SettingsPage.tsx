import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SettingsPayloadSchema, SettingsPayload } from '@/domain/settings';
import { useSettingsStore } from './store/settings.store';
import { Typography } from '@/shared/components/Typography';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Button } from '@/shared/components/Button';
import { Upload, X } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, loadSettings, updateSettings, isLoading } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsPayload>({
    resolver: zodResolver(SettingsPayloadSchema),
    defaultValues: {
      agencyName: '',
      logoBase64: '',
      defaultTaxRate: 0,
      defaultTerms: 'Net 30',
      currency: 'USD',
    },
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      reset({
        agencyName: settings.agencyName,
        logoBase64: settings.logoBase64,
        defaultTaxRate: settings.defaultTaxRate,
        defaultTerms: settings.defaultTerms,
        currency: settings.currency,
      });
    }
  }, [settings, reset]);

  const logoBase64 = watch('logoBase64');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setValue('logoBase64', reader.result as string, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: SettingsPayload) => {
    await updateSettings(data);
    alert('Settings saved successfully!');
  };

  if (isLoading && !settings) {
    return <div className="p-8"><Typography variant="body">Loading settings...</Typography></div>;
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <Typography variant="h1">Settings</Typography>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface p-8 rounded-xl border border-border-subtle shadow-sm">
        
        {/* Branding */}
        <div className="space-y-4">
          <Typography variant="h3" className="border-b border-border-subtle pb-2">Branding</Typography>
          <div className="space-y-2">
            <Label>Agency Name</Label>
            <Input placeholder="Acme Studio" {...register('agencyName')} error={errors.agencyName?.message} />
          </div>
          
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-6">
               {logoBase64 ? (
                 <div className="relative border border-border-subtle rounded-lg p-2 bg-white">
                   <img src={logoBase64} alt="Logo Preview" className="h-20 object-contain max-w-[200px]" />
                   <button 
                     type="button" 
                     onClick={() => setValue('logoBase64', '', { shouldDirty: true })}
                     className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 shadow-sm"
                   >
                     <X className="w-3 h-3" />
                   </button>
                 </div>
               ) : (
                 <div className="border-2 border-dashed border-border-subtle rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground w-full bg-muted/50">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-sm">Click below to upload logo</span>
                 </div>
               )}
               <input 
                 type="file" 
                 accept="image/png, image/jpeg, image/svg+xml"
                 className="hidden"
                 ref={fileInputRef}
                 onChange={handleFileChange}
               />
               {!logoBase64 && (
                 <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                   Choose File
                 </Button>
               )}
            </div>
            <p className="text-xs text-muted-foreground">Max size 2MB. Recommended format: PNG with transparent background.</p>
          </div>
        </div>

        {/* Defaults */}
        <div className="space-y-4 pt-4">
          <Typography variant="h3" className="border-b border-border-subtle pb-2">Invoice Defaults</Typography>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Tax Rate (%)</Label>
              <Input type="number" step="0.1" {...register('defaultTaxRate', { valueAsNumber: true })} error={errors.defaultTaxRate?.message} />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input placeholder="USD" {...register('currency')} error={errors.currency?.message} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default Terms</Label>
            <Input placeholder="Net 30" {...register('defaultTerms')} error={errors.defaultTerms?.message} />
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex justify-end">
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
