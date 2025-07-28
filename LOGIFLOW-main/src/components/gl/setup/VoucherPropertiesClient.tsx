
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';

export function VoucherPropertiesClient() {
  // Basic placeholder content
  // Actual UI for CRUD operations on 'voucher_properties' collection will be built here.

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold text-foreground font-headline">
            Voucher Properties
          </CardTitle>
          <Settings2 className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>
          Manage property types, codes, and descriptions for vouchers (e.g., Cost Centers, Locations).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Voucher properties management UI will be implemented here.
        </p>
        <div className="mt-4 p-4 border rounded-md bg-secondary/50">
          <h3 className="font-semibold text-lg mb-2">Collection Details:</h3>
          <p><strong>Firestore Collection Path:</strong> <code>voucher_properties</code></p>
          <p className="mt-2"><strong>Fields:</strong></p>
          <ul className="list-disc list-inside ml-4 text-sm">
            <li><code>propertyType</code> (string, required) - e.g., 'CostCenter', 'Location'</li>
            <li><code>code</code> (string, required) - e.g., 'HO', 'WH01'</li>
            <li><code>description</code> (string, required)</li>
            <li><code>remarks</code> (string, optional)</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Remember to add initial data to Firestore and implement field validation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
