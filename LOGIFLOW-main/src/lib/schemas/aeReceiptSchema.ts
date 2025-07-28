// src/lib/schemas/aeReceiptSchema.ts
import { z } from 'zod';

const numberPreprocess = (val: unknown) => (val === "" || val === undefined || val === null ? undefined : Number(val));

export const aeReceiptSchema = z.object({
  id: z.string().optional(),
  teamDate: z.string().min(1, 'Team Date is required.'),

  accountInfo: z.object({
    mode: z.string().min(1, 'Mode is required.'),
    subType: z.string().min(1, 'Sub Type is required.'),
    bankAccountNo: z.string().min(1, 'Bank Account # is required.'),
    chequeNo: z.string().min(1, 'Cheque # is required.'),
    chequeDate: z.string().min(1, 'Cheque Date is required.'),
  }),

  customerInfo: z.object({
    customerName: z.string().min(1, 'Customer is required.'),
    currency: z.string().default('PKR'),
    customerRate: z.preprocess(numberPreprocess, z.number().optional()),
    isMultiCurrency: z.boolean().default(false),
    isTotalAmount: z.boolean().default(false),
  }),

  settlement: z.object({
    security: z.string().optional(),
    isOpenDispute: z.boolean().default(false),
  }).optional(),

  linking: z.object({
    jobNo: z.string().optional(),
    invoiceNo: z.string().optional(),
    invoiceDate: z.string().optional(),
    betNo: z.string().optional(),
    hiltNo: z.string().optional(),
    miltNo: z.string().optional(),
    invCurrency: z.string().optional(),
    invRate: z.preprocess(numberPreprocess, z.number().optional()),
    amount: z.preprocess(numberPreprocess, z.number().optional()),
    balance: z.preprocess(numberPreprocess, z.number().optional()),
    fileNo: z.string().optional(),
    controllerNo: z.string().optional(),
    index: z.string().optional(),
  }).optional(),

  manualRemarks: z.object({
    home: z.string().optional(),
    hilt: z.string().optional(),
    milt: z.string().optional(),
    jobNo: z.string().optional(),
    fileNo: z.string().optional(),
    referenceNo: z.string().optional(),
    vehicleNo: z.string().optional(),
  }).optional(),

  summary: z.object({
    totalAmount: z.preprocess(numberPreprocess, z.number().optional()),
    adverse: z.preprocess(numberPreprocess, z.number().optional()),
    bf: z.preprocess(numberPreprocess, z.number().optional()),
    notReceived: z.preprocess(numberPreprocess, z.number().optional()),
    freightCharges: z.preprocess(numberPreprocess, z.number().optional()),
    security: z.preprocess(numberPreprocess, z.number().optional()),
    detention: z.preprocess(numberPreprocess, z.number().optional()),
    bankAmount: z.preprocess(numberPreprocess, z.number().optional()),
  }).optional(),
  
  remarks: z.string().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AEReceipt = z.infer<typeof aeReceiptSchema>;
