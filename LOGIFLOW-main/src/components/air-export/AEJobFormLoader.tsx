
// src/components/air-export/AEJobFormLoader.tsx
import { AEJobForm } from './AEJobForm';
import type { AEJob } from '@/lib/schemas/aeJobSchema';

interface AEJobFormLoaderProps {
  action: 'new' | 'edit';
  jobId?: string;
}

// Mock data that would normally come from a database
const mockCustomers = [
  { name: 'Aero Parts Global', code: 'APG001' },
  { name: 'Tech Innovations Inc.', code: 'TII002' },
  { name: 'Pharma Logistics', code: 'PLG003' },
];

async function getMockAEJobById(id: string): Promise<AEJob | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const storedJobsRaw = typeof window !== 'undefined' ? localStorage.getItem('ae_jobs_mock') : null;
  if (storedJobsRaw) {
    const jobs: AEJob[] = JSON.parse(storedJobsRaw);
    return jobs.find(j => j.id === id) || null;
  }
  return null;
}

export async function AEJobFormLoader({ action, jobId }: AEJobFormLoaderProps) {
  let initialData: AEJob | null = null;

  if (action === 'edit' && jobId) {
    initialData = await getMockAEJobById(jobId);
    if (!initialData) {
      return <div className="p-6 text-red-500">AE Job with ID <strong className="font-mono">{jobId}</strong> not found.</div>;
    }
  }

  return <AEJobForm action={action} initialData={initialData} mockCustomers={mockCustomers} />;
}
