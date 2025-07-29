// src/components/air-import/AIJobFormLoader.tsx
'use client';

import { useEffect, useState } from 'react';
import { AIJobForm } from './AIJobForm';
import type { AIJob } from '@/lib/schemas/aiJobSchema';

type AIJobFormLoaderProps = {
  action: 'new' | 'edit' | 'view';
  id?: string;
};

// Mock function to simulate fetching a job by ID
async function getAIJobById(id: string): Promise<AIJob | null> {
  console.log(`Fetching job with id: ${id}`);
  // In a real app, this would be a database query.
  // For now, we'll check localStorage which is populated by AIJobClient.
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  const storedJobs = localStorage.getItem('ai_jobs_mock');
  if (storedJobs) {
    const jobs: AIJob[] = JSON.parse(storedJobs);
    const job = jobs.find(j => j.id === id);
    return job || null;
  }
  return null;
}

export function AIJobFormLoader({ action, id }: AIJobFormLoaderProps) {
  const [initialData, setInitialData] = useState<AIJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (action === 'edit' || action === 'view') {
      if (id) {
        setIsLoading(true);
        getAIJobById(id).then(data => {
          setInitialData(data);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [action, id]);

  if (isLoading) {
    return <div>Loading job data...</div>;
  }

  if ((action === 'edit' || action === 'view') && !initialData) {
    return <div>Job not found.</div>;
  }

  return <AIJobForm action={action} initialData={initialData} />;
} 