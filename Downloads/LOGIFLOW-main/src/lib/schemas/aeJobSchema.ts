
// src/lib/schemas/aeJobSchema.ts
import { z } from 'zod';

const basicInfoSchema = z.object({
  customerName: z.string().min(1, "Customer is required."),
  customerCode: z.string().optional(),
});

const cargoDetailsSchema = z.object({
  pickupDate: z.string().optional(),
  pickupLocation: z.string().optional(),
  commodity: z.string().min(1, "Commodity is required."),
  volume: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional()
  ),
  weight: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional()
  ),
  chargeableWeight: z.number().nonnegative().optional(),
  dropOffDate: z.string().optional(),
  returnTracking: z.string().optional(),
});

const transportSchema = z.object({
  airline: z.string().min(1, "Airline is required."),
  flightNumber: z.string().min(1, "Flight number is required."),
  departureDateTime: z.string().min(1, "Departure date is required."),
  arrivalDateTime: z.string().min(1, "Arrival date is required."),
});

const chargesSchema = z.object({
  rate: z.number().nonnegative().optional(),
  surcharges: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  taxDistribution: z.string().optional(),
});

const poDetailsSchema = z.object({
  poNumber: z.string().optional(),
  style: z.string().optional(),
});

export const aeJobSchema = z.object({
  id: z.string().optional(),
  basicInfo: basicInfoSchema,
  cargo: cargoDetailsSchema,
  transport: transportSchema,
  charges: chargesSchema,
  poDetails: poDetailsSchema.optional(),
  status: z.enum(["Draft", "Booked"]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AEJob = z.infer<typeof aeJobSchema>;
