
// src/components/sea-export/SEJobFormLoader.tsx
import { SEJobForm } from './SEJobForm';
import type { SEJob } from '@/lib/schemas/seaExportSchema';
import { isValid, parseISO } from 'date-fns';

interface SEJobFormLoaderProps {
  action: 'new' | 'edit';
  jobId?: string;
}

// Updated Mock Data Structure for a single job, aligning with new SEJob schema
const singleMockJobForEdit: SEJob = {
  id: 'mock-edit-1',
  jobNumber: 'SEJ-25-EDIT',
  jobBookingType: 'Direct',
  jobSubType: 'FCL',
  dangerousGoods: 'NonDG',
  costCenter: 'HEAD OFFICE',
  carrierBookingNumber: 'CARRIERBK123',
  fileNumber: 'FILENUM987',
  customer: { name: 'GLOBAL IMPEX SOLUTIONS', code: 'CUST003' },
  customerReference: 'CUSTREF555',
  salesRepresentative: 'Alice Brown (Sales)',
  hasQuotation: true,
  status: 'Draft',
  dates: {
    jobDate: new Date(2025, 4, 10).toISOString(),
    por: new Date(2025, 4, 10).toISOString(),
    cutOff: new Date(2025, 4, 15).toISOString(),
    etd: new Date(2025, 4, 17).toISOString(),
    eta: new Date(2025, 4, 30).toISOString(),
    arrivalDate: new Date(2025, 5, 1).toISOString(),
  },
  ports: {
    placeOfReceipt: 'Factory Site A',
    origin: 'SHANGHAI CHINA',
    portOfDischarge: 'LOS ANGELES USA',
    finalDestination: 'LA Warehouse Z',
    transhipmentPort: 'BUSAN KOREA',
  },
  cargoDetails: {
    commodity: 'ELECTRONICS',
    incoterms: 'CIF',
    pieces: 500,
    packingType: 'Carton',
    weight: 12000,
    weightUnit: 'KG',
    volume: 25,
    volumeUnit: 'CBM',
    isBooked: false,
  },
  vesselAndVoyage: {
    vesselName: 'OCEAN EXPLORER',
    voyageNumber: 'VOY007',
    feederVesselName: 'SEA FEEDER II',
    feederVoyageNumber: 'FDR003',
  },
  shipmentTerms: {
    shippingLine: 'Global Maritime Lines',
    nominationAgent: 'Local Port Agents Inc.',
    freightTerms: 'Prepaid',
    serviceType: 'Door to Port',
    blType: 'Seaway',
  },
  documents: {
    hbl: 'HBLSHAUSA001',
    mbl: 'MBLSHAUSA002',
    siCutOff: new Date(2025, 4, 12).toISOString(),
    vgmCutOff: new Date(2025, 4, 13).toISOString(),
    cooRequired: true,
    insuranceRequired: false,
  },
  charges: {}, // Placeholder
  internalRemarks: 'Handle with care, fragile electronics. Expedite customs.',
  operationsExecutive: 'Jane Smith (Ops)',
  externalRemarks: 'Contains lithium batteries. UN3481.',
  statusTagOffice: 'PRIORITY',
  statusTagTransporter: 'FRAGILE_CARGO',
  transporter: 'Secure Freight LLC',
  coloadedType: 'NotColoaded',
  createdBy: 'user789',
  createdAt: new Date(2025, 4, 1).toISOString(),
  updatedAt: new Date(2025, 4, 5).toISOString(),
};


async function getMockJobById(id: string): Promise<SEJob | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  const storedJobsRaw = typeof window !== 'undefined' ? localStorage.getItem('se_jobs_mock') : null;
  let jobToReturn: SEJob | null = null;

  if (storedJobsRaw) {
    const jobs: SEJob[] = JSON.parse(storedJobsRaw);
    jobToReturn = jobs.find(j => j.id === id || j.jobNumber === id) || null;
  }
  
  // Fallback to a generic single mock if not found in localStorage (e.g. direct edit link access)
  if (!jobToReturn && (id === 'mock-edit-1' || id === 'SEJ-25-EDIT')) {
      jobToReturn = singleMockJobForEdit;
  }

  if (jobToReturn) {
    // Ensure dates are valid or provide defaults (important for date pickers)
    const ensureValidDate = (dateStr?: string, defaultDate = new Date().toISOString()) => 
        dateStr && isValid(parseISO(dateStr)) ? dateStr : defaultDate;
    
    jobToReturn.dates = {
        jobDate: ensureValidDate(jobToReturn.dates?.jobDate),
        por: ensureValidDate(jobToReturn.dates?.por),
        cutOff: ensureValidDate(jobToReturn.dates?.cutOff),
        etd: ensureValidDate(jobToReturn.dates?.etd, undefined), // Optional, so can be undefined
        eta: ensureValidDate(jobToReturn.dates?.eta),
        arrivalDate: ensureValidDate(jobToReturn.dates?.arrivalDate, undefined), // Optional
    };
    jobToReturn.documents = {
        ...jobToReturn.documents,
        siCutOff: jobToReturn.documents?.siCutOff && isValid(parseISO(jobToReturn.documents.siCutOff)) ? jobToReturn.documents.siCutOff : undefined,
        vgmCutOff: jobToReturn.documents?.vgmCutOff && isValid(parseISO(jobToReturn.documents.vgmCutOff)) ? jobToReturn.documents.vgmCutOff : undefined,
    };
  }

  return jobToReturn;
}


export async function SEJobFormLoader({ action, jobId }: SEJobFormLoaderProps) {
  let initialData: SEJob | null = null;

  if (action === 'edit' && jobId) {
    initialData = await getMockJobById(jobId); 
    if (!initialData) {
      return <div className="p-6 text-red-500">Job with ID <strong className="font-mono">{jobId}</strong> not found. It might have been deleted or the ID is incorrect.</div>;
    }
  }

  return <SEJobForm action={action} initialData={initialData} />;
}

