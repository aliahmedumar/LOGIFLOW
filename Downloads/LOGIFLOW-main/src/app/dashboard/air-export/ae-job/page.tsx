
// src/app/dashboard/air-export/ae-job/page.tsx
import { AEJobClient } from '@/components/air-export/AEJobClient';
import { Suspense } from 'react';

export default function AEJobPage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading AE Jobs...</div>}>
        <AEJobClient />
      </Suspense>
    </div>
  );
}
