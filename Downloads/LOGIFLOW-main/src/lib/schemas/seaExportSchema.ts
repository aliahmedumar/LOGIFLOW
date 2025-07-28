
import { z } from 'zod';

// Sub-schemas for nesting
const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  code: z.string().min(1, "Customer code is required"),
});

const datesSchema = z.object({
  jobDate: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid Job Date is required" }),
  por: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid POR date is required" }),
  cutOff: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid Cut-Off date is required" }),
  etd: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid ETD is required" }).optional(),
  eta: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid ETA date is required" }),
  arrivalDate: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid Arrival Date is required" }).optional(),
});

const portsSchema = z.object({
  placeOfReceipt: z.string().optional(),
  origin: z.string().min(1, "Port of Loading is required"),
  portOfDischarge: z.string().min(1, "Port of Discharge is required"),
  finalDestination: z.string().min(1, "Final Destination is required"),
  transhipmentPort: z.string().optional(),
});

const cargoDetailsSchema = z.object({
  commodity: z.string().min(1, "Commodity is required"),
  incoterms: z.enum(['FOB', 'CIF', 'EXW', 'CFR', 'DAP', 'DDP'], { required_error: "Incoterms are required" }),
  pieces: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().nonnegative("Pieces must be zero or positive").optional()
  ),
  packingType: z.enum(['Carton', 'Pallet', 'Container', 'Crate', 'Bag', 'Loose'], { required_error: "Packing Type is required" }),
  weight: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().nonnegative("Weight must be zero or positive").optional()
  ),
  weightUnit: z.enum(['KG', 'LB'], { required_error: "Weight unit is required" }),
  volume: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().nonnegative("Volume must be zero or positive").optional()
  ),
  volumeUnit: z.enum(['CBM', 'CFT'], { required_error: "Volume unit is required" }).optional(),
  isBooked: z.boolean().optional().default(false),
});

const vesselAndVoyageSchema = z.object({
    vesselName: z.string().optional(),
    voyageNumber: z.string().optional(),
    feederVesselName: z.string().optional(),
    feederVoyageNumber: z.string().optional(),
}).optional();

const shipmentTermsSchema = z.object({
    shippingLine: z.string().optional(),
    nominationAgent: z.string().optional(),
    freightTerms: z.enum(['Prepaid', 'Collect', 'Third Party']).optional(),
    serviceType: z.string().optional(),
    blType: z.enum(['Original', 'Seaway', 'Telex Release']).optional(),
}).optional();

const documentsSchema = z.object({
  hbl: z.string().optional(),
  mbl: z.string().optional(),
  siCutOff: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid SI Cut-Off date required" }).optional(),
  vgmCutOff: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid VGM Cut-Off date required" }).optional(),
  cooRequired: z.boolean().optional().default(false),
  insuranceRequired: z.boolean().optional().default(false),
}).optional();


// Main SEJob schema
export const seJobSchema = z.object({
  id: z.string().optional(),
  jobNumber: z.string().min(1, "Job number is required"),

  dates: datesSchema,
  jobBookingType: z.enum(['Direct', 'Indirect'], { required_error: "Job Booking Type is required" }),
  jobSubType: z.enum(['FCL', 'LCL', 'Breakbulk'], { required_error: "Job Sub Type is required" }),
  dangerousGoods: z.enum(['DG', 'NonDG'], { required_error: "DG/NonDG selection is required" }),
  costCenter: z.string().min(1, "Cost Center is required"),
  carrierBookingNumber: z.string().optional(),
  fileNumber: z.string().optional(),

  customer: customerSchema,
  customerReference: z.string().optional(),
  salesRepresentative: z.string().min(1, "Sales Rep is required"),
  hasQuotation: z.boolean().optional().default(false),

  ports: portsSchema,

  cargoDetails: cargoDetailsSchema,

  vesselAndVoyage: vesselAndVoyageSchema,
  shipmentTerms: shipmentTermsSchema,
  documents: documentsSchema,

  charges: z.any().optional(),

  internalRemarks: z.string().optional(),
  operationsExecutive: z.string().optional(),

  externalRemarks: z.string().optional(),

  status: z.enum(['Draft', 'Submitted', 'Booted', 'DG', 'Closed', 'Cancelled'], { required_error: "Status is required" }),
  statusTagOffice: z.string().optional(),
  statusTagTransporter: z.string().optional(),
  transporter: z.string().optional(),
  coloadedType: z.enum(['Nanoe', 'LCL', 'NotColoaded']).optional(),

  createdBy: z.string().optional(),
  createdAt: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid Created At date required" }).optional(),
  updatedAt: z.string().refine((val) => val === '' || val === undefined || !isNaN(Date.parse(val)), { message: "Valid Updated At date required" }).optional(),
  draftTimestamp: z.string().optional(),
})
.refine(data => {
    if (data.dates?.etd && data.dates?.eta) {
        return new Date(data.dates.eta) >= new Date(data.dates.etd);
    }
    return true;
}, {
    message: "ETA cannot be earlier than ETD",
    path: ["dates", "eta"],
})
.refine(data => {
    if (data.dates?.cutOff && data.dates?.por) {
        return new Date(data.dates.cutOff) >= new Date(data.dates.por);
    }
    return true;
}, {
    message: "Cut Off date cannot be earlier than POR date",
    path: ["dates", "cutOff"],
})
.refine(data => {
    const pieces = data.cargoDetails?.pieces;
    const weight = data.cargoDetails?.weight;
    if (typeof pieces === 'number' && pieces > 0) {
        return typeof weight === 'number' && weight >= 0;
    }
    return true;
}, {
    message: "Weight must be 0 or more if Pieces are specified",
    path: ["cargoDetails", "weight"],
});


export type SEJob = z.infer<typeof seJobSchema>;
export type SEJobStatus = SEJob['status'];
