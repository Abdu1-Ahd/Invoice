import { z } from 'zod';

export const PaymentMethodSchema = z.enum(['Cash', 'Bank Transfer', 'Credit Card', 'PayPal', 'Other']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  method: PaymentMethodSchema,
  reference: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  date: z.number(), // Unix timestamp of payment
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const PaymentPayloadSchema = PaymentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;
