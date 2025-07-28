// src/app/dashboard/air-import/ai-invoice/page.tsx
import { AIInvoiceClient } from '@/components/air-import/AIInvoiceClient';
import { Suspense } from 'react';

export default function AIInvoicePage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading AI Invoices...</div>}>
        <AIInvoiceClient />
      </Suspense>
    </div>
  );
}
