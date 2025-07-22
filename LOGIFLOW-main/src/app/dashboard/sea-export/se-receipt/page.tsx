// src/app/dashboard/sea-export/se-receipt/page.tsx
import { SEReceiptClient } from '@/components/sea-export/SEReceiptClient';
import { Suspense } from 'react';

export default function SEReceiptPage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading SE Receipts...</div>}>
        <SEReceiptClient />
      </Suspense>
    </div>
  );
}
