// src/app/dashboard/sea-import/si-receipt/page.tsx
import { SIReceiptClient } from '@/components/sea-import/SIReceiptClient';
import { Suspense } from 'react';

export default function SIReceiptPage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading SI Receipts...</div>}>
        <SIReceiptClient />
      </Suspense>
    </div>
  );
}
