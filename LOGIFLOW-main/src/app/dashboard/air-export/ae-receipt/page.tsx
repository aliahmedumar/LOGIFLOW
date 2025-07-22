// src/app/dashboard/air-export/ae-receipt/page.tsx
import { AEReceiptClient } from '@/components/air-export/AEReceiptClient';
import { Suspense } from 'react';

export default function AEReceiptPage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading AE Receipts...</div>}>
        <AEReceiptClient />
      </Suspense>
    </div>
  );
}
