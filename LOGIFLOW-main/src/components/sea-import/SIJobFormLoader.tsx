
// src/components/sea-import/SIJobFormLoader.tsx
import { SIJobForm } from './SIJobForm';
import type { SIJob } from '@/lib/schemas/siJobSchema';
import { isValid, parseISO } from 'date-fns';

interface SIJobFormLoaderProps {
  action: 'new' | 'edit';
  jobId?: string;
}

async function getMockJobById(id: string): Promise<SIJob | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  const storedJobsRaw = typeof window !== 'undefined' ? localStorage.getItem('si_jobs_mock') : null;
  let jobToReturn: SIJob | null = null;

  if (storedJobsRaw) {
    const jobs: SIJob[] = JSON.parse(storedJobsRaw);
    jobToReturn = jobs.find(j => j.id === id || j.jobNumber === id) || null;
  }
  
  if (jobToReturn) {
    const ensureValidDate = (dateStr?: string, defaultDate = new Date().toISOString()) => 
        dateStr && isValid(parseISO(dateStr)) ? dateStr : defaultDate;
    
    jobToReturn.dates = {
        jobDate: ensureValidDate(jobToReturn.dates?.jobDate),
        por: ensureValidDate(jobToReturn.dates?.por),
        cutOff: ensureValidDate(jobToReturn.dates?.cutOff),
        etd: ensureValidDate(jobToReturn.dates?.etd, undefined),
        eta: ensureValidDate(jobToReturn.dates?.eta),
        arrivalDate: ensureValidDate(jobToReturn.dates?.arrivalDate, undefined),
    };
    jobToReturn.documents = {
        ...jobToReturn.documents,
        siCutOff: jobToReturn.documents?.siCutOff && isValid(parseISO(jobToReturn.documents.siCutOff)) ? jobToReturn.documents.siCutOff : undefined,
        vgmCutOff: jobToReturn.documents?.vgmCutOff && isValid(parseISO(jobToReturn.documents.vgmCutOff)) ? jobToReturn.documents.vgmCutOff : undefined,
    };
  }

  return jobToReturn;
}


export async function SIJobFormLoader({ action, jobId }: SIJobFormLoaderProps) {
  let initialData: SIJob | null = null;

  if (action === 'edit' && jobId) {
    initialData = await getMockJobById(jobId); 
    if (!initialData) {
      return <div className="p-6 text-red-500">Job with ID <strong className="font-mono">{jobId}</strong> not found. It might have been deleted or the ID is incorrect.</div>;
    }
  }

  return <SIJobForm action={action} initialData={initialData} />;
}
