// src/app/dashboard/sea-export/se-bl/page.tsx
import { SEBlClient } from '@/components/sea-export/SEBlClient';
import { Suspense } from 'react';

export default function SEBlPage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading B/Ls...</div>}>
        <SEBlClient />
      </Suspense>
    </div>
  );
}
