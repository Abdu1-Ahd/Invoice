import { z } from 'zod';

export const SettingsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().optional(), // For future auth integration
  agencyName: z.string().max(100).optional().or(z.literal('')),
  logoBase64: z.string().optional().or(z.literal('')),
  defaultTaxRate: z.number().min(0).max(100),
  defaultTerms: z.string().optional().or(z.literal('')),
  currency: z.string().length(3),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const SettingsPayloadSchema = SettingsSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type SettingsPayload = z.infer<typeof SettingsPayloadSchema>;
