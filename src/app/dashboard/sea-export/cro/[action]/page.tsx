// src/app/dashboard/sea-export/cro/[action]/page.tsx
import { CROFormLoader } from '@/components/sea-export/CROFormLoader';
import { Suspense } from 'react';

interface CROFormPageProps {
  params: { action: string }; // 'new' or 'edit'
  searchParams: { id?: string }; // CRO ID for editing
}

export default function CROFormPage({ params, searchParams }: CROFormPageProps) {
  const { action } = params;
  const { id } = searchParams;

  if (action !== 'new' && action !== 'edit') {
    return <div className="p-6 text-red-500">Invalid action specified for CRO form.</div>;
  }
  if (action === 'edit' && !id) {
    return <div className="p-6 text-red-500">CRO ID is required for editing.</div>;
  }

  return (
    <div className="flex-1 bg-background min-h-screen p-4 md:p-6">
      <Suspense fallback={<div className="p-6 text-center">Loading CRO Form...</div>}>
        <CROFormLoader action={action as 'new' | 'edit'} croId={id} />
      </Suspense>
    </div>
  );
}
