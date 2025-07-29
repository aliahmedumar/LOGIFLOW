// src/components/sea-export/SEBlFormLoader.tsx
import { SEBlForm } from './SEBlForm';
import type { SE_BL } from '@/lib/schemas/seBlSchema';

interface SEBlFormLoaderProps {
  action: 'new' | 'edit';
  blId?: string;
}

async function getMockBLById(id: string): Promise<SE_BL | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const storedBlsRaw = typeof window !== 'undefined' ? localStorage.getItem('se_bl_mock') : null;
  if (storedBlsRaw) {
    const bls: SE_BL[] = JSON.parse(storedBlsRaw);
    return bls.find(bl => bl.id === id) || null;
  }
  return null;
}

export async function SEBlFormLoader({ action, blId }: SEBlFormLoaderProps) {
  let initialData: SE_BL | null = null;

  if (action === 'edit' && blId) {
    initialData = await getMockBLById(blId);
    if (!initialData) {
      return <div className="p-6 text-red-500">B/L with ID <strong className="font-mono">{blId}</strong> not found.</div>;
    }
  }

  return <SEBlForm action={action} initialData={initialData} />;
}
