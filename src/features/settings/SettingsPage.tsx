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
import { Upload, X, Check, Palette } from 'lucide-react';

const THEME_OPTIONS = [
  {
    id: 'default',
    name: 'Classic Slate',
    description: 'Clean executive light ledger with royal navy and teal accents.',
    swatches: ['#f8fafc', '#1b497e', '#20807b', '#ffffff'],
  },
  {
    id: 'navy',
    name: 'Royal Navy & Gold',
    description: 'Deep ocean blue paired with antique warm gold, inspired by the logo.',
    swatches: ['#091321', '#102138', '#dcac62', '#2e938d'],
  },
  {
    id: 'emerald',
    name: 'British Emerald & Gold',
    description: 'Sophisticated deep racing green and teal with warm golden accents.',
    swatches: ['#071917', '#0e2a26', '#dcac62', '#2e938d'],
  },
  {
    id: 'ivory',
    name: 'Antique Parchment',
    description: 'Old Money cream linen and cotton paper with classic sapphire typography.',
    swatches: ['#f5f2eb', '#fcfbf9', '#1c385c', '#b88628'],
  },
  {
    id: 'dark',
    name: 'Executive Onyx',
    description: 'Sleek obsidian midnight sapphire for high contrast executive focus.',
    swatches: ['#0b111e', '#131d2e', '#d4a359', '#2e938d'],
  },
];

export const SettingsPage: React.FC = () => {
  const { settings, loadSettings, updateSettings, isLoading } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaved, setIsSaved] = useState(false);

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
      theme: 'default',
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
        theme: settings.theme || 'default',
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
    if (isSaved) return;
    // ponytail: fallback placeholders to defaults if user left them empty
    const payload: SettingsPayload = {
      ...data,
      currency: data.currency ? data.currency.trim().toUpperCase() : 'PKR',
      defaultTaxRate: isNaN(Number(data.defaultTaxRate)) ? 0 : Number(data.defaultTaxRate),
      defaultTerms: data.defaultTerms ? data.defaultTerms.trim() : 'Net 30',
      theme: data.theme || 'default',
    };
    await updateSettings(payload);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  if (isLoading && !settings) {
    return <div className="p-8"><Typography variant="body">Loading settings...</Typography></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6">
      <Typography variant="h1">Settings</Typography>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-sm">
        {/* Theme & Appearance */}
        <div className="space-y-4">
          <div className="border-b border-border pb-2 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <Typography variant="h3">Theme & Appearance (Old Money Palettes)</Typography>
          </div>
          <p className="text-sm text-text-secondary">
            Select a refined luxury aesthetic inspired by your brand identity and logo colors. The theme transforms the application instantly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {THEME_OPTIONS.map((t) => {
              const isSelected = (watch('theme') || 'default') === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setValue('theme', t.id, { shouldDirty: true });
                    document.documentElement.setAttribute('data-theme', t.id);
                  }}
                  className={`cursor-pointer relative rounded-xl border-2 p-4 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border bg-surface hover:border-text-muted'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-semibold text-text-primary text-sm tracking-tight">{t.name}</span>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-4">{t.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg border border-border bg-muted/30">
                    {t.swatches.map((color, idx) => (
                      <span
                        key={idx}
                        className="h-6 w-6 rounded-full border border-black/10 shadow-inner flex-shrink-0 transition-transform duration-300 hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={`Color swatch ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-4">
          <Typography variant="h3" className="border-b border-border pb-2">Branding</Typography>
          <div className="space-y-2">
            <Label>Agency Name</Label>
            <Input placeholder="Acme Studio" {...register('agencyName')} error={errors.agencyName?.message} />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-6">
              {logoBase64 ? (
                <div className="relative border border-border rounded-lg p-2 bg-white">
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
                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-text-muted w-full bg-muted/50">
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
    </div>
  );
};
