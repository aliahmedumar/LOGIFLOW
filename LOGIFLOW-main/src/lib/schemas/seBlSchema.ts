// src/lib/schemas/seBlSchema.ts
import { z } from 'zod';

const blInfoSchema = z.object({
  jobRef: z.string().min(3, "Job# must be at least 3 characters."),
  hblNo: z.string()
    .min(1, "HBL# is required.")
    .optional(),
  shipper: z.string().min(5, "Shipper must be at least 5 characters."),
  consignee: z.string().min(5, "Consignee must be at least 5 characters."),
  vessel: z.string().min(3, "Vessel must be at least 3 characters."),
  voyageNo: z.string().min(1, "Voyage# is required.").regex(/^[A-Z]{3}\d{3}$/, { message: "Voyage# must be 3 letters followed by 3 numbers (e.g., KMX412)." }),
  sailingDate: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid Sailing Date is required" }).optional(),
});

const inVitroSchema = z.object({
  refHistory: z.string().optional(),
  testingNotes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
});

const workflowSchema = z.object({
  purpose: z.enum(['Notify Party 1', 'Delivery Agent'], { required_error: 'Purpose is required.' }),
  partStatus: z.enum(['New', 'Discharging'], { required_error: 'Part Status is required.' }),
});

const complianceSchema = z.object({
  importType: z.enum(['Personal', 'Server']).optional(),
  hasMetClass: z.boolean().refine(val => val === true, {
    message: "'Has met Class' must be checked.",
  }),
  clientCount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().nonnegative("Client count cannot be negative.").optional()
  ),
});

const blDetailSchema = z.object({
  inVitro: inVitroSchema.optional(),
  workflow: workflowSchema.optional(),
  compliance: complianceSchema.optional(),
}).optional();


export const seBlSchema = z.object({
  id: z.string().optional(),
  blInfo: blInfoSchema,
  blDetail: blDetailSchema,
  containers: z.array(z.any()).optional().default([]),
  details: z.object({}).optional(),
  stamps: z.object({}).optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'issued']).default('draft'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type SE_BL = z.infer<typeof seBlSchema>;
