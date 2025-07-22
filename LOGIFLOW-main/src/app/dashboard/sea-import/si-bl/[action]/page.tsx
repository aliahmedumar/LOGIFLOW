
// src/app/dashboard/sea-import/si-bl/[action]/page.tsx
import { SIBlFormLoader } from '@/components/sea-import/SIBlFormLoader';
import { Suspense } from 'react';

interface SIBlFormPageProps {
  params: { action: string }; // 'new' or 'edit'
  searchParams: { id?: string }; // B/L ID for editing
}

export default function SIBlFormPage({ params, searchParams }: SIBlFormPageProps) {
  const { action } = params;
  const { id } = searchParams;

  if (action !== 'new' && action !== 'edit') {
    return <div className="p-6 text-red-500">Invalid action specified for B/L form.</div>;
  }
  if (action === 'edit' && !id) {
    return <div className="p-6 text-red-500">B/L ID is required for editing.</div>;
  }

  return (
    <div className="flex-1 bg-background min-h-screen p-4 md:p-6">
      <Suspense fallback={<div className="p-6 text-center">Loading SI B/L Form...</div>}>
        <SIBlFormLoader action={action as 'new' | 'edit'} blId={id} />
      </Suspense>
    </div>
  );
}
