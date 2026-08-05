import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SettingsPayloadSchema, SettingsPayload } from '@/domain/settings';
import { useSettingsStore } from './store/settings.store';
import { Typography } from '@/shared/components/Typography';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Button } from '@/shared/components/Button';
import { CurrencySelect } from '@/shared/components/CurrencySelect';
import { ErrorModal } from '@/shared/components/ErrorModal';
import { Upload, X, Check } from 'lucide-react';
import { PageSkeleton } from '@/shared/components/PageSkeleton';

export const SettingsPage: React.FC = () => {
  const { settings, loadSettings, updateSettings, isLoading } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title?: string; message: string }>({
    isOpen: false,
    message: '',
  });

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
      currency: 'PKR',
    },
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      reset({
        agencyName: settings.agencyName || '',
        logoBase64: settings.logoBase64 || '',
        defaultTaxRate: settings.defaultTaxRate ?? 0,
        defaultTerms: settings.defaultTerms || 'Net 30',
        currency: settings.currency || 'PKR',
      });
    }
  }, [settings, reset]);

  const logoBase64 = watch('logoBase64');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorModal({
        isOpen: true,
        title: 'File Size Exceeded',
        message: 'The selected logo image exceeds the 2MB size limit. Please choose a smaller image file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setValue('logoBase64', reader.result as string, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: SettingsPayload) => {
    if (isSaved) return;
    // ponytail: fallback placeholders to defaults if user left them empty
    const payload: SettingsPayload = {
      ...data,
      currency: data.currency ? data.currency.trim().toUpperCase() : 'PKR',
      defaultTaxRate: isNaN(Number(data.defaultTaxRate)) ? 0 : Number(data.defaultTaxRate),
      defaultTerms: data.defaultTerms ? data.defaultTerms.trim() : 'Net 30',
    };
    await updateSettings(payload);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <PageSkeleton loading={isLoading && !settings} className="space-y-6">
        <Typography variant="h1">Settings</Typography>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-sm">

        {/* Branding */}
        <div className="space-y-4">
          <Typography variant="h3" className="border-b border-border pb-2">Branding</Typography>
          <div className="space-y-2">
            <Label>Agency Name</Label>
            <Input placeholder="Acme Studio" {...register('agencyName')} error={errors.agencyName?.message} />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {logoBase64 ? (
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-4 bg-surface flex items-center justify-center w-full">
                  <img src={logoBase64} alt="Logo Preview" className="h-24 object-contain max-w-full" />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Change Logo
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setValue('logoBase64', '', { shouldDirty: true })}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-text-muted w-full bg-muted/30 hover:bg-muted/70 hover:border-primary/60 cursor-pointer transition-all duration-200 group"
              >
                <Upload className="w-6 h-6 mb-2 text-text-muted group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium group-hover:text-text-primary transition-colors">Click to upload logo</span>
              </div>
            )}
            <p className="text-xs text-text-muted">Max size 2MB. Recommended format: PNG with transparent background.</p>
          </div>
        </div>

        {/* Defaults */}
        <div className="space-y-4 pt-4">
          <Typography variant="h3" className="border-b border-border pb-2">Invoice Defaults</Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0"
                {...register('defaultTaxRate', { valueAsNumber: true })}
                error={errors.defaultTaxRate?.message}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <CurrencySelect
                value={watch('currency')}
                placeholder="PKR"
                onChange={(val) => setValue('currency', val, { shouldDirty: true })}
                error={errors.currency?.message}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default Terms</Label>
            <Input placeholder="Net 30" {...register('defaultTerms')} error={errors.defaultTerms?.message} />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button 
            type="submit" 
            variant={isSaved ? "secondary" : "primary"} 
            isLoading={isSubmitting}
            disabled={isSaved}
            className={isSaved ? "bg-green-600 hover:bg-green-600 text-white border-green-600 transition-all duration-300" : ""}
          >
            {isSaved ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Saved!
              </span>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </form>
      </PageSkeleton>

      <ErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
