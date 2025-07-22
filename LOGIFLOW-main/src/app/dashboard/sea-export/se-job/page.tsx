
// src/app/dashboard/sea-export/se-job/page.tsx
import { SEJobClient } from '@/components/sea-export/SEJobClient';
import { Suspense } from 'react';

export default function SEJobPage() {
  // Add permission check here in a real app
  // For example:
  // const { user } = useAuth();
  // if (!user || !user.permissions.includes('sea_export_jobs_read')) { // More specific permission
  //   return <div className="p-6">Access Denied. You do not have permission to view this page.</div>;
  // }

  return (
    <div className="flex-1 bg-background min-h-screen">
      <Suspense fallback={<div className="p-6">Loading SE Jobs...</div>}>
        <SEJobClient />
      </Suspense>
    </div>
  );
}
