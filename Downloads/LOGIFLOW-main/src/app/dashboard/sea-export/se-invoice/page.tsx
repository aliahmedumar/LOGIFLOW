// src/app/dashboard/sea-export/se-invoice/page.tsx
import { SEInvoiceClient } from '@/components/sea-export/SEInvoiceClient';
import { Suspense } from 'react';

export default function SEInvoicePage() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading SE Invoices...</div>}>
        <SEInvoiceClient />
      </Suspense>
    </div>
  );
}
