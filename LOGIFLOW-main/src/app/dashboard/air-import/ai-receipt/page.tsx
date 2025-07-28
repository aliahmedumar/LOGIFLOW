// src/app/dashboard/air-import/ai-receipt/page.tsx
import { AIReceiptClient } from '@/components/air-import/AIReceiptClient';
import { Suspense } from 'react';

export default function AIReceiptPage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading AI Receipts...</div>}>
        <AIReceiptClient />
      </Suspense>
    </div>
  );
}
