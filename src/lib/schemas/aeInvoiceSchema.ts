// src/lib/schemas/aeInvoiceSchema.ts
import { z } from 'zod';

export const chargeItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  sizeType: z.string().optional(),
  rate: z.number().min(0, "Rate must be positive"),
  qty: z.number().min(1, "Qty must be at least 1"),
  amount: z.number().min(0, "Amount must be positive"),
  taxable: z.boolean().default(false),
});

export const wthTdsSchema = z.object({
  incomeTax: z.object({
    enabled: z.boolean().default(false),
    rate: z.number().optional(),
  }).default({ enabled: false }),
  salesTax: z.object({
    enabled: z.boolean().default(false),
    rate: z.number().optional(),
  }).default({ enabled: false }),
  furtherTax: z.object({
    enabled: z.boolean().default(false),
    rate: z.number().optional(),
  }).default({ enabled: false }),
  fed: z.object({
    enabled: z.boolean().default(false),
    rate: z.number().optional(),
  }).default({ enabled: false }),
});

export const aeInvoiceSchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string().optional(), // Auto-generated
  invoiceType: z.enum(['Standard', 'Credit Note', 'Debit Note']).default('Standard'),
  status: z.enum(['Draft', 'Finalized', 'Settled']).default('Draft'),
  
  invoiceDate: z.string().min(1, "Invoice date is required"),
  reference: z.string().optional(),
  
  customerName: z.string().min(1, "Customer is required"),
  dueDays: z.number().int().min(0).default(30),
  bankDetail: z.string().optional(),
  
  jobId: z.string().min(1, "Job # is required"),
  invoiceTitle: z.string().min(1, "Invoice title is required"),
  category: z.string().optional(),
  costCenter: z.string().min(1, "Cost center is required"),
  currency: z.string().default('PKR'),
  
  charges: z.array(chargeItemSchema).min(1, "At least one charge item is required"),
  
  remarks: z.string().optional(),
  
  // Calculated fields (will be handled in form, not directly submitted)
  totalAmount: z.number().default(0),
  discount: z.number().min(0).default(0),
  netAmount: z.number().default(0),
  taxAmount: z.number().default(0),
  grossTotal: z.number().default(0),
  
  wthTds: wthTdsSchema.default({}),
  
  settledAmount: z.number().default(0),
  balance: z.number().default(0),
  
  taxInvoiceNumber: z.string().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  
  // Denormalized data for listing
  jobInfo: z.object({
    hbl: z.string().optional(),
    mbl: z.string().optional(),
  }).optional(),
});

export type AEInvoice = z.infer<typeof aeInvoiceSchema>;
export type ChargeItem = z.infer<typeof chargeItemSchema>;
