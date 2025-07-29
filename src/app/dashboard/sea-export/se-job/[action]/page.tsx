
// src/app/dashboard/sea-export/se-job/[action]/page.tsx
import { SEJobFormLoader } from '@/components/sea-export/SEJobFormLoader';
import { Suspense } from 'react';

interface SEJobFormPageProps {
  params: { action: string }; // 'new' or 'edit'
  searchParams: { id?: string }; // Job ID for editing
}

export default function SEJobFormPage({ params, searchParams }: SEJobFormPageProps) {
  const { action } = params;
  const { id } = searchParams;

  // Basic validation for action
  if (action !== 'new' && action !== 'edit') {
    return <div className="p-6 text-red-500">Invalid action specified for SE Job form.</div>;
  }
  if (action === 'edit' && !id) {
    return <div className="p-6 text-red-500">Job ID is required for editing an SE Job.</div>;
  }

  return (
    <div className="flex-1 bg-background min-h-screen p-4 md:p-6">
      <Suspense fallback={<div className="p-6 text-center">Loading SE Job Form...</div>}>
        <SEJobFormLoader action={action as 'new' | 'edit'} jobId={id} />
      </Suspense>
    </div>
  );
}

// Optional: Generate static params if you have a known set of actions (not typical for 'edit' with dynamic IDs)
// export async function generateStaticParams() {
//   return [{ action: 'new' }];
// }
