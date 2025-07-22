// src/components/air-import/AIJobClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Filter, Edit, Trash2, MoreVertical, FileText, Copy, Printer } from "lucide-react";
import { useRouter } from 'next/navigation';
import { AIJob } from '@/lib/schemas/aiJobSchema';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock data is now removed. The component will start with an empty list.
const initialMockJobs: AIJob[] = [];

export function AIJobClient() {
  const router = useRouter();
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const [activeTab, setActiveTab] = useState<'direct' | 'coload'>('direct');

  useEffect(() => {
    // In a real app, you'd fetch data from your API
    // For now, we use localStorage to persist mock data across navigations
    const storedJobs = localStorage.getItem('ai_jobs_mock');
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    } else {
      // Initialize with an empty array if nothing is in storage
      setJobs(initialMockJobs);
      localStorage.setItem('ai_jobs_mock', JSON.stringify(initialMockJobs));
    }
  }, []);

  const handleDelete = (jobId: string) => {
    try {
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      localStorage.setItem('ai_jobs_mock', JSON.stringify(updatedJobs));
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const directJobs = jobs.filter(j => j.jobType === 'Direct');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">AI Job</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="job_date">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job_date">Job Date</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search in Results" className="pl-8" />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            <Button onClick={() => router.push('/dashboard/air-import/ai-job/new')} size="icon"><PlusCircle className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="mt-4 border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('direct')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'direct' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {directJobs.length} Shipment Direct
            </button>
            <button
              onClick={() => setActiveTab('coload')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'coload' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              0 Shipment Coload
            </button>
          </nav>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'direct' && (
          <div className="space-y-4">
            {directJobs.map(job => (
              <Card key={job.id} className="shadow-md">
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Customer & Status */}
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">Customer</div>
                      <div className="font-semibold text-blue-600">{job.customer}</div>
                      <div className="mt-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{job.status}</span>
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="col-span-1">
                      <div className="text-sm text-muted-foreground">Job Date</div>
                      <div className="font-semibold">{format(new Date(job.jobDate), 'dd-MMM-yyyy')}</div>
                      <div className="text-sm text-muted-foreground mt-1">Job #</div>
                      <div className="font-semibold">{job.fileNo}</div>
                    </div>

                    {/* Route */}
                    <div className="col-span-5 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground">Origin</div>
                            <div className="font-bold">{job.airportOfLoading}</div>
                        </div>
                        <div className="flex-grow mx-4 border-t-2 border-dotted border-gray-400 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-1 text-gray-400">✈</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground">Destination</div>
                            <div className="font-bold">{job.airportOfDischarge}</div>
                        </div>
                    </div>
                    
                    {/* Other Details */}
                     <div className="col-span-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">CR #</span> <span className="font-semibold">--</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">BR #</span> <span className="font-semibold">--</span></div>
                    </div>
                     <div className="col-span-1 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Sales Rep</span> <span className="font-semibold">{job.salesRep}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Manifest #</span> <span className="font-semibold">--</span></div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/air-import/ai-job/edit?id=${job.id}`)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><FileText className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Printer className="h-4 w-4" /></Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the job
                                and remove its data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(job.id!)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
         {activeTab === 'coload' && (
            <div className="text-center py-10 text-muted-foreground">
                No Coload shipments available.
            </div>
        )}
      </CardContent>
    </Card>
  );
} 