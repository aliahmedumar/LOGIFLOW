// src/app/dashboard/sea-export/se-bl/[action]/page.tsx
import { SEBlFormLoader } from '@/components/sea-export/SEBlFormLoader';
import { Suspense } from 'react';

interface SEBlFormPageProps {
  params: { action: string }; // 'new' or 'edit'
  searchParams: { id?: string }; // B/L ID for editing
}

export default function SEBlFormPage({ params, searchParams }: SEBlFormPageProps) {
  const { action } = params;
  const { id } = searchParams;

  // Basic validation for action
  if (action !== 'new' && action !== 'edit') {
    return <div className="p-6 text-red-500">Invalid action specified for B/L form.</div>;
  }
  if (action === 'edit' && !id) {
    return <div className="p-6 text-red-500">B/L ID is required for editing.</div>;
  }

  return (
    <div className="flex-1 bg-background min-h-screen p-4 md:p-6">
      <Suspense fallback={<div className="p-6 text-center">Loading B/L Form...</div>}>
        <SEBlFormLoader action={action as 'new' | 'edit'} blId={id} />
      </Suspense>
    </div>
  );
}
