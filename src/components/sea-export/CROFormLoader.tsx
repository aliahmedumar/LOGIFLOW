// src/components/sea-export/CROFormLoader.tsx
import { CROForm } from './CROForm';
import type { CRO } from '@/lib/schemas/croSchema';
import type { SEJob } from '@/lib/schemas/seaExportSchema';

interface CROFormLoaderProps {
  action: 'new' | 'edit';
  croId?: string;
}

// Mock function to fetch SE Jobs for the dropdown
async function getSEJobs(): Promise<SEJob[]> {
  // In a real app, this would be a database query.
  // We'll use localStorage which is populated by SEJobClient.
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate tiny delay
  const storedJobsRaw = typeof window !== 'undefined' ? localStorage.getItem('se_jobs_mock') : null;
  if (storedJobsRaw) {
    try {
      return JSON.parse(storedJobsRaw);
    } catch (e) {
      console.error("Failed to parse SE jobs for CRO form", e);
      return [];
    }
  }
  return [];
}

async function getMockCROById(id: string): Promise<CRO | null> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
  const storedCrosRaw = typeof window !== 'undefined' ? localStorage.getItem('cro_orders_mock') : null;
  if (storedCrosRaw) {
    const cros: CRO[] = JSON.parse(storedCrosRaw);
    return cros.find(c => c.id === id) || null;
  }
  return null;
}

export async function CROFormLoader({ action, croId }: CROFormLoaderProps) {
  let initialData: CRO | null = null;
  const seJobs = await getSEJobs();

  if (action === 'edit' && croId) {
    initialData = await getMockCROById(croId); 
    if (!initialData) {
      return <div className="p-6 text-red-500">CRO with ID <strong className="font-mono">{croId}</strong> not found.</div>;
    }
  }

  return <CROForm action={action} initialData={initialData} seJobs={seJobs} />;
}
