// src/app/dashboard/air-export/ae-invoice/page.tsx
import { AEInvoiceClient } from '@/components/air-export/AEInvoiceClient';
import { Suspense } from 'react';

export default function AEInvoicePage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading AE Invoices...</div>}>
        <AEInvoiceClient />
      </Suspense>
    </div>
  );
}
