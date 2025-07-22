// src/lib/schemas/croSchema.ts
import { z } from 'zod';

// Optional sub-schemas for better organization
const partiesSchema = z.object({
    overseasAgent: z.string().optional(),
    clearingAgent: z.string().optional(),
    shipper: z.string().optional(),
}).optional();

const routingSchema = z.object({
    portOfLoading: z.string().optional(),
    portOfDischarge: z.string().optional(),
    finalDestination: z.string().optional(),
    commodity: z.string().optional(),
}).optional();

const logisticsSchema = z.object({
    terminal: z.string().optional(),
    emptyDepot: z.string().optional(),
    transporter: z.string().optional(),
}).optional();

const vesselInfoSchema = z.object({
    vessel: z.string().optional(),
    voyage: z.string().optional(),
    sailingDate: z.string().optional(),
}).optional();

const actionsSchema = z.object({
    manual: z.boolean().optional(),
    printLogo: z.boolean().optional(),
    continueMode: z.boolean().optional(),
}).optional();


// Main CRO schema
export const croSchema = z.object({
  id: z.string().optional(),
  croNo: z.string().optional(), // Auto-generated
  status: z.enum(['Draft', 'Issued', 'Cancelled']),
  
  // Section 1: Basic Info
  croType: z.string().min(1, "CRO Type is required"),
  jobRef: z.string().min(1, "Job# is required"),
  client: z.string().optional(), // Auto-filled
  equipQty: z.number().int().min(1, "Equipment quantity must be at least 1"),
  siteType: z.string().optional(),

  // Section 2: Dates & Reference
  issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Valid Issue Date is required" }),
  validForDays: z.number().int().min(1, "Validity must be at least 1 day"),
  refNo: z.string().optional(),

  // Section 3: Parties
  parties: partiesSchema,
  pickupLocation: z.string().optional(),

  // Section 4: Routing
  routing: routingSchema,

  // Section 5: Logistics
  logistics: logisticsSchema,
  cargoType: z.enum(['General', 'Hazardous']),

  // Section 6: Vessel Info
  vesselInfo: vesselInfoSchema,

  // Section 7: Actions
  actions: actionsSchema,
  
  // Timestamps
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CRO = z.infer<typeof croSchema>;
