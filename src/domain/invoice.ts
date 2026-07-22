import { z } from 'zod';

export const InvoiceStatusSchema = z.enum(['Draft', 'Sent', 'Paid', 'Overdue']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoiceItemSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  description: z.string().min(1, 'Description is required'),
  subDescription: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
});
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  status: InvoiceStatusSchema,
  issueDate: z.number(),
  dueDate: z.number(),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  taxableAmount: z.number().min(0).optional(), // Make it optional for backward compatibility
  taxRate: z.number().min(0).max(100),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  notes: z.string().optional().or(z.literal('')),
  terms: z.string().optional().or(z.literal('')),
  billingAddress: z.string().optional().or(z.literal('')),
  paymentMethod: z.string().optional().or(z.literal('')),
  latePenalty: z.string().optional().or(z.literal('')),
  currency: z.string().optional(),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number().min(0),
  }).optional(),
  billingCycle: z.enum(['One-Time', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Custom']).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const InvoiceItemPayloadSchema = InvoiceItemSchema.omit({
  id: true,
  invoiceId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  total: true, // Calculated automatically
});
export type InvoiceItemPayload = z.infer<typeof InvoiceItemPayloadSchema>;

export const InvoicePayloadSchema = InvoiceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  subtotal: true, // Calculated
  discountAmount: true, // Calculated
  taxableAmount: true, // Calculated
  taxAmount: true, // Calculated
  totalAmount: true, // Calculated
});
export type InvoicePayload = z.infer<typeof InvoicePayloadSchema>;

export const FullInvoicePayloadSchema = z.object({
  invoice: InvoicePayloadSchema,
  items: z.array(InvoiceItemPayloadSchema).min(1, 'At least one item is required'),
});
export type FullInvoicePayload = z.infer<typeof FullInvoicePayloadSchema>;
