
// src/app/dashboard/sea-import/si-bl/page.tsx
import { SIBlClient } from '@/components/sea-import/SIBlClient';
import { Suspense } from 'react';

export default function SIBlPage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading SI B/Ls...</div>}>
        <SIBlClient />
      </Suspense>
    </div>
  );
}
