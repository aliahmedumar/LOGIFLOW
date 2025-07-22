
// src/components/sea-import/SIBlFormLoader.tsx
import { SIBlForm } from './SIBlForm';
import type { SI_BL } from '@/lib/schemas/siBlSchema';

interface SIBlFormLoaderProps {
  action: 'new' | 'edit';
  blId?: string;
}

async function getMockBLById(id: string): Promise<SI_BL | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const storedBlsRaw = typeof window !== 'undefined' ? localStorage.getItem('si_bl_mock') : null;
  if (storedBlsRaw) {
    const bls: SI_BL[] = JSON.parse(storedBlsRaw);
    return bls.find(bl => bl.id === id) || null;
  }
  return null;
}

export async function SIBlFormLoader({ action, blId }: SIBlFormLoaderProps) {
  let initialData: SI_BL | null = null;

  if (action === 'edit' && blId) {
    initialData = await getMockBLById(blId);
    if (!initialData) {
      return <div className="p-6 text-red-500">SI B/L with ID <strong className="font-mono">{blId}</strong> not found.</div>;
    }
  }

  return <SIBlForm action={action} initialData={initialData} />;
}
