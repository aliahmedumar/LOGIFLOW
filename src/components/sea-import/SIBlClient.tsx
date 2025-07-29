
// src/components/sea-import/SIBlClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';
import type { SI_BL } from '@/lib/schemas/siBlSchema';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';

export function SIBlClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [billsOfLading, setBillsOfLading] = useState<SI_BL[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Mock fetching data from localStorage
    const storedBls = localStorage.getItem('si_bl_mock');
    if (storedBls) {
      setBillsOfLading(JSON.parse(storedBls));
    }
    setIsLoading(false);
  }, []);

  const handleAddNewBL = () => {
    router.push('/dashboard/sea-import/si-bl/new');
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'dd-MMM-yyyy') : 'Invalid Date';
    } catch {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading SI Bills of Lading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 relative min-h-[calc(100vh-10rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground font-headline">SI Bill of Lading</h1>
      </div>
      
      <div className="space-y-6 pb-20">
        {billsOfLading.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No SI B/Ls found.</p>
                <Button onClick={handleAddNewBL} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add SI B/L
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          billsOfLading.map((bl) => (
            <Card key={bl.id} className="shadow-lg">
              <CardHeader className="pb-3 pt-4 px-4 border-b bg-card rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-primary">{bl.blInfo.hblNo}</CardTitle>
                <span className="text-sm text-muted-foreground">{bl.blInfo.supplier}</span>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="font-semibold text-muted-foreground">Job Ref:</span> {bl.blInfo.jobRef}</div>
                <div><span className="font-semibold text-muted-foreground">Sailing Date:</span> {formatDate(bl.blInfo.sailingDate)}</div>
                <div><span className="font-semibold text-muted-foreground">Vessel/Voyage:</span> {bl.blInfo.vessel} / {bl.blInfo.voyageNo}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-0 fixed right-8 bottom-8 z-50 shadow-xl h-14 w-14 flex items-center justify-center"
        onClick={handleAddNewBL}
        aria-label="Add New SI B/L"
      >
        <Plus className="h-7 w-7" />
      </Button>
    </div>
  );
}
