// src/lib/schemas/aiJobSchema.ts
import { z } from 'zod';

const poDetailSchema = z.object({
  id: z.string().optional(),
  poReference: z.string().optional(),
  style: z.string().optional(),
  packages: z.string().optional(),
  packCode: z.string().optional(),
  status: z.string().optional(),
});

const itemDetailSchema = z.object({
  id: z.string().optional(),
  noOfPcs: z.number().optional(),
  unit: z.string().optional(),
  grossWt: z.number().optional(),
  kgLb: z.enum(['KG', 'LB']).optional(),
  rClass: z.string().optional(),
  itemNo: z.string().optional(),
  chargeableWt: z.number().optional(),
  rateCharge: z.number().optional(),
  total: z.number().optional(),
  lineWeight: z.number().optional(),
});

const dimensionSchema = z.object({
  id: z.string().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  qty: z.number().optional(),
  volume: z.number().optional(),
  weight: z.number().optional(),
});

const chargeDetailSchema = z.object({
    id: z.string().optional(),
    chargeName: z.string(),
    description: z.string().optional(),
    type: z.string(),
    basis: z.string(),
    pp_cc: z.enum(['PP', 'CC']),
    customerName: z.string(),
    rate: z.number(),
    currency: z.string(),
    amount: z.number(),
});


export const aiJobSchema = z.object({
  id: z.string().optional(),
  
  // Basic Info
  customer: z.string().min(1, 'Customer is required'),
  customerRef: z.string().optional(),
  salesRep: z.string().min(1, 'Sales Rep is required'),
  quotation: z.string().optional(),

  // Dates and Types (Right Sidebar)
  jobDate: z.string().min(1, "Job Date is required."),
  jobType: z.enum(['Direct', 'Coload']),
  dgNonDg: z.enum(['DG', 'NonDG']),
  costCenter: z.string().optional(),
  carrierBooking: z.string().optional(),
  fileNo: z.string().optional(),

  // Origin
  placeOfReceipt: z.string().optional(),
  airportOfLoading: z.string().min(1, 'Airport of Loading is required'),
  airportOfTranshipment: z.string().optional(),

  // Destination
  airportOfDischarge: z.string().min(1, 'Airport of Discharge is required'),
  finalDestination: z.string().optional(),

  // Cargo Details
  commodity: z.string().min(1, 'Commodity is required'),
  incoTerms: z.string().optional(),
  pcs: z.number().positive().optional(),
  packingUnit: z.string().optional(),
  grossWeight: z.number().positive('Gross Weight must be positive'),
  volume: z.number().positive().optional(),
  volWt: z.number().positive().optional(),
  cwtLine: z.number().positive().optional(),
  cwtClient: z.number().positive().optional(),

  // Pickup and Dropoff
  cargoPickup: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
  cargoDropoff: z.string().optional(),
  dropoffDate: z.string().optional(),
  dropoffTime: z.string().optional(),

  // Transport
  airLine: z.string().min(1, 'Air Line is required'),
  flightNo: z.string().min(1, 'Flight # is required'),
  departureDate: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalDate: z.string().optional(),
  arrivalTime: z.string().optional(),

  // PO Detail
  poDetails: z.array(poDetailSchema).optional(),

  // AWB Information
  hawb: z.string().min(1, 'HAWB # is required'),
  hawbDate: z.string().optional(),
  mawb: z.string().optional(),
  mawbDate: z.string().optional(),
  indexNumber: z.string().optional(),
  subIndex: z.string().optional(),
  invoiceNo: z.string().optional(),
  invoiceDate: z.string().optional(),
  exportNo: z.string().optional(),
  exportDate: z.string().optional(),
  contractNo: z.string().optional(),
  contractDate: z.string().optional(),
  lcNo: z.string().optional(),
  lcDate: z.string().optional(),
  reqDoc: z.string().optional(),
  noOfOriginalBls: z.string().optional(),

  // Parties
  shipper: z.string().optional(),
  consignee: z.string().optional(),
  notifyParty1: z.string().optional(),
  notifyParty2: z.string().optional(),
  deliveryAgent: z.string().optional(),
  
  // Item Detail
  itemDetails: z.array(itemDetailSchema).optional(),
  dimensions: z.array(dimensionSchema).optional(),
  marksAndNumbers: z.string().optional(),
  descriptionOfGoods: z.string().optional(),

  // Charges
  receivables: z.array(chargeDetailSchema).optional(),
  payables: z.array(chargeDetailSchema).optional(),

  // Status
  status: z.enum(['Opened', 'Booked', 'Completed', 'Cancelled']).default('Opened'),
});

export type AIJob = z.infer<typeof aiJobSchema>; 