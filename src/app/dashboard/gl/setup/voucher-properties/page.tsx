
import { VoucherPropertiesClient } from '@/components/gl/setup/VoucherPropertiesClient';
import { Suspense } from 'react';

export default function VoucherPropertiesPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <Suspense fallback={<div>Loading Voucher Properties...</div>}>
        <VoucherPropertiesClient />
      </Suspense>
    </div>
  );
}
