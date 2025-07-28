// src/app/dashboard/sea-import/si-invoice/page.tsx
import { SIInvoiceClient } from '@/components/sea-import/SIInvoiceClient';
import { Suspense } from 'react';

export default function SIInvoicePage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading SI Invoices...</div>}>
        <SIInvoiceClient />
      </Suspense>
    </div>
  );
}
