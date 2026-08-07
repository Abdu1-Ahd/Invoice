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
import { motion, AnimatePresence } from 'framer-motion';

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
      <Typography variant="h1" className="mb-6">Settings</Typography>
      <PageSkeleton loading={isLoading && !settings} className="flex flex-col gap-6">

      <motion.form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-8 bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-sm"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >

        {/* Branding */}
        <motion.div 
          className="space-y-4"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
          }}
        >
          <Typography variant="h3" className="border-b border-border pb-2">Branding</Typography>
          <div className="space-y-2">
            <Label>Agency Name</Label>
            <Input placeholder="Acme Studio" {...register('agencyName')} error={errors.agencyName?.message} />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-text-primary">Logo</Label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {/* Logo Preview / Upload Container Box */}
            <motion.div
              whileHover={{ scale: 1.01, borderColor: 'var(--color-primary, #1c385c)' }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 sm:h-44 border border-border rounded-xl bg-card flex items-center justify-center p-4 cursor-pointer transition-colors shadow-xs group relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
              {logoBase64 ? (
                <motion.img
                  key="logo"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  src={logoBase64}
                  alt="Logo Preview"
                  className="max-h-28 sm:max-h-32 max-w-[85%] object-contain"
                />
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-text-muted"
                >
                  <Upload className="w-8 h-8 mb-2 group-hover:text-primary transition-colors opacity-70" />
                  <span className="text-sm font-medium group-hover:text-text-primary transition-colors">
                    Click to upload logo
                  </span>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>

            {/* Action Buttons Centered Below Box */}
            <div className="flex items-center justify-center gap-3 pt-1 pb-1">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                className="bg-secondary hover:bg-secondary/80 text-text-primary border-0 font-medium px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4 text-text-primary" />
                {logoBase64 ? 'Change Logo' : 'Upload Logo'}
              </Button>

              {logoBase64 && (
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={() => setValue('logoBase64', '', { shouldDirty: true })}
                  className="bg-danger hover:bg-danger/90 text-white border-0 font-medium px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  <X className="w-4 h-4 text-white" />
                  Remove
                </Button>
              )}
            </div>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-text-muted pt-1">
              Max size 2MB. Recommended format: PNG with transparent background.
            </p>
          </div>
        </motion.div>

        {/* Defaults */}
        <motion.div 
          className="space-y-4 pt-4"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
          }}
        >
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
        </motion.div>

        <motion.div 
          className="pt-4 border-t border-border flex justify-end"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
          }}
        >
          <motion.div animate={{ scale: isSaved ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.4 }}>
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
          </motion.div>
        </motion.div>
      </motion.form>
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
