
// src/app/dashboard/air-export/ae-job/[action]/page.tsx
import { AEJobFormLoader } from '@/components/air-export/AEJobFormLoader';
import { Suspense } from 'react';

interface AEJobFormPageProps {
  params: { action: string }; // 'new' or 'edit'
  searchParams: { id?: string }; // Job ID for editing
}

export default function AEJobFormPage({ params, searchParams }: AEJobFormPageProps) {
  const { action } = params;
  const { id } = searchParams;

  if (action !== 'new' && action !== 'edit') {
    return <div className="p-6 text-red-500">Invalid action specified for AE Job form.</div>;
  }
  if (action === 'edit' && !id) {
    return <div className="p-6 text-red-500">Job ID is required for editing an AE Job.</div>;
  }

  return (
    <div className="flex-1 bg-background min-h-screen p-4 md:p-6">
      <Suspense fallback={<div className="p-6 text-center">Loading AE Job Form...</div>}>
        <AEJobFormLoader action={action as 'new' | 'edit'} jobId={id} />
      </Suspense>
    </div>
  );
}
