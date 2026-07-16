import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(250).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  createdAt: z.number(), // Unix timestamp
  updatedAt: z.number(), // Unix timestamp
  deletedAt: z.number().nullable(), // Null means active
});

export type Customer = z.infer<typeof CustomerSchema>;

// Payload used for creating/updating
export const CustomerPayloadSchema = CustomerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type CustomerPayload = z.infer<typeof CustomerPayloadSchema>;
