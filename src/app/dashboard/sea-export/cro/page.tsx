// src/app/dashboard/sea-export/cro/page.tsx
import { CROClient } from '@/components/sea-export/CROClient';
import { Suspense } from 'react';

export default function CROPage() {
  // Permission checks would happen here in a real app
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading CROs...</div>}>
        <CROClient />
      </Suspense>
    </div>
  );
}
