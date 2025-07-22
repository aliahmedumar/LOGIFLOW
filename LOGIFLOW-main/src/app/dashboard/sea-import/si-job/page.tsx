
// src/app/dashboard/sea-import/si-job/page.tsx
import { SIJobClient } from '@/components/sea-import/SIJobClient';
import { Suspense } from 'react';

export default function SIJobPage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading SI Jobs...</div>}>
        <SIJobClient />
      </Suspense>
    </div>
  );
}
