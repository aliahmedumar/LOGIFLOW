
// src/app/dashboard/gl/setup/chart-of-accounts/[action]/page.tsx
import { AccountFormClient } from '@/components/gl/setup/AccountFormClient';
import { Suspense } from 'react';

interface AccountFormPageProps {
  params: { action: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

function AccountFormPageContent({ params, searchParams }: AccountFormPageProps) {
  const { action } = params;
  const accountId = typeof searchParams.id === 'string' ? searchParams.id : undefined;

  if (action !== 'new' && action !== 'edit') {
    return <div className="p-4">Invalid action.</div>;
  }
  if (action === 'edit' && !accountId) {
    return <div className="p-4">Account ID is required for editing.</div>;
  }

  return <AccountFormClient action={action as 'new' | 'edit'} accountId={accountId} />;
}


export default function AccountFormPage({ params, searchParams }: AccountFormPageProps) {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <Suspense fallback={<div>Loading form...</div>}>
        <AccountFormPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
