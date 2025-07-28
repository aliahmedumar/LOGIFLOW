
// src/app/dashboard/sea-import/si-job/[action]/page.tsx
import { SIJobFormLoader } from '@/components/sea-import/SIJobFormLoader';
import { Suspense } from 'react';

interface SIJobFormPageProps {
  params: { action: string }; // 'new' or 'edit'
  searchParams: { id?: string }; // Job ID for editing
}

export default function SIJobFormPage({ params, searchParams }: SIJobFormPageProps) {
  const { action } = params;
  const { id } = searchParams;

  if (action !== 'new' && action !== 'edit') {
    return <div className="p-6 text-red-500">Invalid action specified for SI Job form.</div>;
  }
  if (action === 'edit' && !id) {
    return <div className="p-6 text-red-500">Job ID is required for editing an SI Job.</div>;
  }

  return (
    <div className="flex-1 bg-background min-h-screen p-4 md:p-6">
      <Suspense fallback={<div className="p-6 text-center">Loading SI Job Form...</div>}>
        <SIJobFormLoader action={action as 'new' | 'edit'} jobId={id} />
      </Suspense>
    </div>
  );
}
