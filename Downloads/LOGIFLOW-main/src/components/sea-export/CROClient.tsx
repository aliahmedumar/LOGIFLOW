// src/components/sea-export/CROClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit3, Trash2, FileText, Terminal } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { CRO } from '@/lib/schemas/croSchema'; 
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock Data for CROs
const initialMockCROs: CRO[] = [
  {
    id: 'cro_mock1',
    croNo: 'CRO-24-0001',
    jobRef: 'SEJ-25-0001',
    issueDate: new Date(2025, 2, 5).toISOString(),
    validForDays: 7,
    parties: {
      overseasAgent: 'Global Agents Inc.',
      clearingAgent: 'Speedy Customs Brokers',
      shipper: 'MERCITEX PRIVATE LIMITED',
    },
    status: 'Issued',
    createdAt: new Date(2025, 2, 5).toISOString(),
    updatedAt: new Date(2025, 2, 5).toISOString(),
    client: 'MERCITEX PRIVATE LIMITED', // This should be part of the schema or joined data
  },
  {
    id: 'cro_mock2',
    croNo: 'CRO-24-0002',
    jobRef: 'SEJ-25-0002',
    issueDate: new Date(2025, 1, 15).toISOString(),
    validForDays: 5,
    parties: {
      overseasAgent: 'APAC Logistics',
      clearingAgent: 'ClearFast Solutions',
      shipper: 'ALPHA TRADING CO.',
    },
    status: 'Draft',
    createdAt: new Date(2025, 1, 14).toISOString(),
    updatedAt: new Date(2025, 1, 14).toISOString(),
    client: 'ALPHA TRADING CO.',
  },
];

export function CROClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [cros, setCros] = useState<CRO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [croToDelete, setCroToDelete] = useState<CRO | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // In a real app, this would be a database query. We use localStorage for mocking.
    const storedCros = localStorage.getItem('cro_orders_mock');
    if (storedCros) {
      setCros(JSON.parse(storedCros));
    } else {
      setCros(initialMockCROs);
      localStorage.setItem('cro_orders_mock', JSON.stringify(initialMockCROs));
    }
    setIsLoading(false);
  }, []);

  const updateMockCroStorage = (updatedCros: CRO[]) => {
    setCros(updatedCros);
    localStorage.setItem('cro_orders_mock', JSON.stringify(updatedCros));
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading CROs...</div>;
  }

  const handleAddNewCRO = () => {
    router.push('/dashboard/sea-export/cro/new');
  };

  const handleEditCRO = (croId: string) => {
    router.push(`/dashboard/sea-export/cro/edit?id=${croId}`);
  };

  const openDeleteConfirmDialog = (cro: CRO) => {
    setCroToDelete(cro);
  };

  const handleDeleteCRO = () => {
    if (!croToDelete) return;
    const updatedCros = cros.filter(c => c.id !== croToDelete.id);
    updateMockCroStorage(updatedCros);
    toast({ title: "CRO Deleted", description: `CRO "${croToDelete.croNo}" has been deleted.` });
    setCroToDelete(null);
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

  const getStatusBadgeClass = (status?: CRO['status']) => {
    switch (status) {
      case 'Issued': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'Draft': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'Cancelled': return 'bg-red-500 hover:bg-red-600 text-white';
      default: return 'bg-slate-300 text-slate-800';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 relative min-h-[calc(100vh-10rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground font-headline">Container Release Orders (CRO)</h1>
        {/* Filters can be added here later */}
      </div>

      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>System Update</AlertTitle>
        <AlertDescription>
          The upgraded CRO form has been launched! The previous version is now archived.
        </AlertDescription>
      </Alert>

      <div className="space-y-6 pb-20">
        {cros.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No CROs found.</p>
                <p className="text-sm text-muted-foreground">Click the '+' button to create a new CRO.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          cros.map((cro) => (
            <Card key={cro.id} className="shadow-lg">
              <CardHeader className="pb-3 pt-4 px-4 border-b bg-card rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-primary">{cro.croNo}</CardTitle>
                    <span className="text-sm text-muted-foreground">{cro.client || 'N/A'}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCRO(cro.id!)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteConfirmDialog(cro)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="font-semibold text-muted-foreground">Status:</span> <Badge className={cn('font-semibold', getStatusBadgeClass(cro.status))}>{cro.status}</Badge></div>
                <div><span className="font-semibold text-muted-foreground">Job Ref:</span> {cro.jobRef}</div>
                <div><span className="font-semibold text-muted-foreground">Issue Date:</span> {formatDate(cro.issueDate)}</div>
                <div><span className="font-semibold text-muted-foreground">Valid For:</span> {cro.validForDays} days</div>
                <div><span className="font-semibold text-muted-foreground">Shipper:</span> {cro.parties?.shipper}</div>
                <div><span className="font-semibold text-muted-foreground">Overseas Agent:</span> {cro.parties?.overseasAgent}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-0 fixed right-8 bottom-8 z-50 shadow-xl h-14 w-14 flex items-center justify-center"
        onClick={handleAddNewCRO}
        aria-label="Add New CRO"
      >
        <Plus className="h-7 w-7" />
      </Button>

      <AlertDialog open={!!croToDelete} onOpenChange={(isOpen) => !isOpen && setCroToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the CRO <strong>{croToDelete?.croNo}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCroToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCRO} className="bg-destructive hover:bg-destructive/90">
              Delete CRO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
