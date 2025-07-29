
// src/components/air-export/AEJobClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Plane, Edit3, Trash2 } from 'lucide-react';
import type { AEJob } from '@/lib/schemas/aeJobSchema';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isValid } from 'date-fns';

const initialMockJobs: AEJob[] = []; // Start with an empty list

export function AEJobClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<AEJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<AEJob | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const storedJobs = localStorage.getItem('ae_jobs_mock');
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    } else {
      setJobs(initialMockJobs);
      localStorage.setItem('ae_jobs_mock', JSON.stringify(initialMockJobs));
    }
    setIsLoading(false);
  }, []);

  const updateMockJobsStorage = (updatedJobs: AEJob[]) => {
    setJobs(updatedJobs);
    localStorage.setItem('ae_jobs_mock', JSON.stringify(updatedJobs));
  };
  
  if (isLoading) {
    return <div className="p-6 text-center">Loading AE Jobs...</div>;
  }

  const handleAddNewJob = () => {
    router.push('/dashboard/air-export/ae-job/new');
  };

  const handleEditJob = (jobId: string) => {
    router.push(`/dashboard/air-export/ae-job/edit?id=${jobId}`);
  };

  const openDeleteConfirmDialog = (job: AEJob) => {
    setJobToDelete(job);
  };

  const handleDeleteJob = () => {
    if (!jobToDelete) return;
    const updatedJobs = jobs.filter(j => j.id !== jobToDelete.id);
    updateMockJobsStorage(updatedJobs);
    toast({ title: "AE Job Deleted", description: `Job for customer "${jobToDelete.basicInfo.customerName}" has been deleted.` });
    setJobToDelete(null);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString || !isValid(parseISO(dateString))) return 'N/A';
    return format(parseISO(dateString), 'dd-MMM-yyyy');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 relative min-h-[calc(100vh-10rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground font-headline">Air Export Jobs</h1>
      </div>

      <div className="space-y-6 pb-20">
        {jobs.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Plane className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No AE Jobs found.</p>
                <Button onClick={handleAddNewJob} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="shadow-lg">
              <CardHeader className="pb-3 pt-4 px-4 border-b">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-primary">{job.basicInfo.customerName}</CardTitle>
                   <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditJob(job.id!)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteConfirmDialog(job)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                 <Badge variant={job.status === 'Booked' ? 'default' : 'secondary'}>{job.status}</Badge>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="font-semibold text-muted-foreground">Commodity:</span> {job.cargo.commodity}</div>
                <div><span className="font-semibold text-muted-foreground">Airline:</span> {job.transport.airline} / {job.transport.flightNumber}</div>
                <div><span className="font-semibold text-muted-foreground">Departure:</span> {formatDate(job.transport.departureDateTime)}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

       <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-0 fixed right-8 bottom-8 z-50 shadow-xl h-14 w-14 flex items-center justify-center"
        onClick={handleAddNewJob}
        aria-label="Add New AE Job"
      >
        <Plus className="h-7 w-7" />
      </Button>

       <AlertDialog open={!!jobToDelete} onOpenChange={(isOpen) => !isOpen && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the AE job for <strong>{jobToDelete?.basicInfo.customerName}</strong>.
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
