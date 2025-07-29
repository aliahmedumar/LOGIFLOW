
// src/components/sea-import/SIJobClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Anchor, CheckCircle, AlertTriangle, Plus, Search, Edit3, Trash2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { SIJob } from '@/lib/schemas/siJobSchema'; 
import { cn } from '@/lib/utils';

// Updated Mock Data to align with the new SIJob schema
const initialMockJobs: SIJob[] = [
  {
    id: 'mock_si_1',
    jobNumber: 'SIJ-25-0001',
    jobBookingType: 'Direct',
    jobSubType: 'FCL',
    dangerousGoods: 'NonDG',
    costCenter: 'HEAD OFFICE',
    customer: { name: 'MERCITEX PRIVATE LIMITED', code: 'CUST001' },
    status: 'Booted',
    statusTagOffice: 'HEAD OFFICE',
    dates: {
      jobDate: new Date(2025, 2, 1).toISOString(),
      por: new Date(2025, 2, 1).toISOString(),
      cutOff: new Date(2025, 2, 10).toISOString(),
      etd: new Date(2025, 2, 12).toISOString(),
      eta: new Date(2025, 2, 25).toISOString(),
      arrivalDate: new Date(2025, 2, 26).toISOString(),
    },
    ports: {
      placeOfReceipt: 'KHI-WAREHOUSE',
      origin: 'KARACHI PAKISTAN',
      portOfDischarge: 'AD DAMMAM',
      finalDestination: 'DAMMAM YARD',
    },
    cargoDetails: {
        commodity: 'TEXTILES',
        incoterms: 'FOB',
        pieces: 100,
        packingType: 'Pallet',
        weight: 5000,
        weightUnit: 'KG',
        volume: 10,
        volumeUnit: 'CBM',
        isBooked: true,
    },
    documents: { hbl: 'HBLKHIADM123', mbl: 'MBLKHIADM456' },
    transporter: 'Elite Transports',
    salesRepresentative: 'John Doe (Sales)',
    coloadedType: 'NotColoaded',
    createdBy: 'user123',
    createdAt: new Date(2025,2,1).toISOString(),
    updatedAt: new Date(2025,2,1).toISOString(),
    importDeclarationNumber: 'ID-12345',
  },
];


export function SIJobClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<SIJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('job_date_newest'); 
  const [selectedRep, setSelectedRep] = useState<string>('ALL_REPS');
  const [jobToDelete, setJobToDelete] = useState<SIJob | null>(null);

  const uniqueSalesReps = useMemo(() => {
    const reps = new Set(jobs.map(job => job.salesRepresentative).filter(Boolean) as string[]);
    return Array.from(reps);
  }, [jobs]);

  useEffect(() => {
    setIsLoading(true);
    const storedJobs = localStorage.getItem('si_jobs_mock');
    if (storedJobs) {
        try {
            const parsedJobs = JSON.parse(storedJobs) as SIJob[];
            if (Array.isArray(parsedJobs)) {
                 setJobs(parsedJobs.map(job => ({
                    ...job,
                    dates: {
                        ...job.dates,
                        jobDate: job.dates.jobDate && isValid(parseISO(job.dates.jobDate)) ? job.dates.jobDate : new Date().toISOString(),
                        por: job.dates.por && isValid(parseISO(job.dates.por)) ? job.dates.por : new Date().toISOString(),
                        cutOff: job.dates.cutOff && isValid(parseISO(job.dates.cutOff)) ? job.dates.cutOff : new Date().toISOString(),
                        eta: job.dates.eta && isValid(parseISO(job.dates.eta)) ? job.dates.eta : new Date().toISOString(),
                        etd: job.dates.etd && isValid(parseISO(job.dates.etd)) ? job.dates.etd : undefined,
                        arrivalDate: job.dates.arrivalDate && isValid(parseISO(job.dates.arrivalDate)) ? job.dates.arrivalDate : undefined,
                    }
                })));
            } else {
                setJobs(initialMockJobs);
                localStorage.setItem('si_jobs_mock', JSON.stringify(initialMockJobs));
            }
        } catch (error) {
            console.error("Error parsing jobs from localStorage:", error);
            setJobs(initialMockJobs);
            localStorage.setItem('si_jobs_mock', JSON.stringify(initialMockJobs));
        }
    } else {
        setJobs(initialMockJobs);
        localStorage.setItem('si_jobs_mock', JSON.stringify(initialMockJobs));
    }
    setIsLoading(false);
  }, []);

  const updateMockJobsStorage = (updatedJobs: SIJob[]) => {
    setJobs(updatedJobs);
    localStorage.setItem('si_jobs_mock', JSON.stringify(updatedJobs));
  };


  const filteredAndSortedJobs = useMemo(() => {
    let displayJobs = jobs.filter(job =>
      (job.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRep === 'ALL_REPS' || !selectedRep || job.salesRepresentative === selectedRep)
    );

    if (sortBy === 'job_date_newest') {
      displayJobs.sort((a, b) => {
          const dateA = a.dates?.jobDate ? parseISO(a.dates.jobDate).getTime() : 0;
          const dateB = b.dates?.jobDate ? parseISO(b.dates.jobDate).getTime() : 0;
          return dateB - dateA;
      });
    } else if (sortBy === 'job_date_oldest') {
      displayJobs.sort((a, b) => {
          const dateA = a.dates?.jobDate ? parseISO(a.dates.jobDate).getTime() : 0;
          const dateB = b.dates?.jobDate ? parseISO(b.dates.jobDate).getTime() : 0;
          return dateA - dateB;
      });
    }
    return displayJobs;
  }, [jobs, searchTerm, sortBy, selectedRep]);
  

  if (isLoading) {
    return <div className="p-6 text-center">Loading SI Job data...</div>;
  }

  const handleAddNewJob = () => {
    router.push('/dashboard/sea-import/si-job/new');
  };

  const handleEditJob = (jobId: string) => {
    router.push(`/dashboard/sea-import/si-job/edit?id=${jobId}`);
  };

  const openDeleteConfirmDialog = (job: SIJob) => {
    setJobToDelete(job);
  };

  const handleDeleteJob = () => {
    if (!jobToDelete) return;
    const updatedJobs = jobs.filter(job => job.id !== jobToDelete.id);
    updateMockJobsStorage(updatedJobs);
    toast({ title: "Job Deleted", description: `Job "${jobToDelete.jobNumber}" has been deleted.`, variant: "default", className:"bg-green-500 text-white" });
    setJobToDelete(null);
  };

  const handleCloseView = () => {
    router.push('/dashboard/sea-import');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid Date';
      return format(date, 'dd-MMM-yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeClass = (status?: SIJob['status']) => {
    switch (status) {
      case 'Booted': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'DG': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'Draft': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'Closed': return 'bg-gray-500 hover:bg-gray-600 text-white';
      case 'Cancelled': return 'bg-red-500 hover:bg-red-600 text-white';
      default: return 'bg-slate-300 text-slate-800';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 relative min-h-[calc(100vh-10rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground font-headline">Sea Import Jobs</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Customer/Job No..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort By..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort Order</SelectLabel>
                <SelectItem value="job_date_newest">Job Date (Newest First)</SelectItem>
                <SelectItem value="job_date_oldest">Job Date (Oldest First)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6 pb-20">
        {filteredAndSortedJobs.length === 0 && (
           <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Anchor className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No jobs found.</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters, or add a new job.</p>
              </div>
            </CardContent>
          </Card>
        )}
        {filteredAndSortedJobs.map((job) => (
          <Card key={job.id || job.jobNumber} className="shadow-lg">
            <CardHeader className="pb-3 pt-4 px-4 border-b bg-card rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg font-semibold text-primary">{job.customer.name}</CardTitle>
                    <span className="font-mono text-sm text-muted-foreground bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{job.customer.code}</span>
                </div>
                <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditJob(job.id || job.jobNumber)}>
                        <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteConfirmDialog(job)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <Badge variant={'default'} className={cn('font-semibold', getStatusBadgeClass(job.status))}>
                  {job.status}
                </Badge>
                <Badge variant="outline" className="text-xs">{job.jobSubType}</Badge>
                {job.dangerousGoods === 'DG' && <Badge variant="destructive" className="text-xs">DG</Badge>}
              </div>

              <div>
                 <p className="text-sm">
                  <span className="font-semibold text-foreground">Job No:</span> {job.jobNumber}
                </p>
                 <p className="text-sm">
                  <span className="font-semibold text-foreground">Import Declaration#:</span> {job.importDeclarationNumber || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-0 fixed right-8 bottom-24 z-50 shadow-xl h-14 w-14 flex items-center justify-center"
        onClick={handleAddNewJob}
        aria-label="Add New SI Job"
      >
        <Plus className="h-7 w-7" />
      </Button>

      <AlertDialog open={!!jobToDelete} onOpenChange={(isOpen) => !isOpen && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job <strong>{jobToDelete?.jobNumber}</strong> for customer <strong>{jobToDelete?.customer.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive hover:bg-destructive/90">
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
