'use client';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex h-screen w-screen items-center justify-center bg-background"><p>Loading Dashboard...</p></div>;
  }

  return <AppShell>{children}</AppShell>;
}
