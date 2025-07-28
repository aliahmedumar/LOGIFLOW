
// src/components/sea-import/SIJobForm.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siJobSchema, type SIJob, type SIJobStatus } from '@/lib/schemas/siJobSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Save, Loader2, FileText, Ship, Users, Briefcase, Building, DollarSign, Settings, Info, MessageCircle, Copy, UserPlus, Bookmark, PackageSearch, LinkIcon, StickyNote, Route } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


// Mock data for dropdowns
const mockCustomers = [
  { name: 'MERCITEX PRIVATE LIMITED', code: 'CUST001' },
  { name: 'ALPHA TRADING CO.', code: 'CUST002' },
  { name: 'GLOBAL IMPEX SOLUTIONS', code: 'CUST003' },
  { name: 'OCEANWIDE IMPORTS', code: 'CUST004' },
];

const mockStaff = [
  { id: 'staff001', name: 'John Doe (Sales)' },
  { id: 'staff002', name: 'Jane Smith (Ops)' },
  { id: 'staff003', name: 'Alice Brown (Sales)' },
];

const mockCostCenters = [
  { id: 'cc001', name: 'HEAD OFFICE' },
  { id: 'cc002', name: 'BRANCH A' },
  { id: 'cc003', name: 'WAREHOUSE OPS' },
];

const incotermsOptions = ['FOB', 'CIF', 'EXW', 'CFR', 'DAP', 'DDP'] as const;
const packingTypeOptions = ['Carton', 'Pallet', 'Container', 'Crate', 'Bag', 'Loose'] as const;
const weightUnitOptions = ['KG', 'LB'] as const;
const volumeUnitOptions = ['CBM', 'CFT'] as const;
const jobBookingTypeOptions = ['Direct', 'Indirect'] as const;
const jobSubTypeOptions = ['FCL', 'LCL', 'Breakbulk'] as const;
const dangerousGoodsOptions = ['DG', 'NonDG'] as const;
const jobStatusOptions = ['Draft', 'Submitted', 'Booted', 'DG', 'Closed', 'Cancelled'] as const;


const defaultValues: SIJob = {
    id: undefined,
    jobNumber: `SIJ-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    jobBookingType: 'Direct',
    jobSubType: 'FCL',
    dangerousGoods: 'NonDG',
    costCenter: mockCostCenters[0]?.name || '',
    customer: { name: '', code: '' },
    salesRepresentative: mockStaff[0]?.name || '',
    hasQuotation: false,
    dates: {
      jobDate: new Date().toISOString(),
      por: new Date().toISOString(),
      cutOff: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      eta: new Date(new Date().setDate(new Date().getDate() + 21)).toISOString(),
      etd: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
      arrivalDate: new Date(new Date().setDate(new Date().getDate() + 22)).toISOString(),
    },
    ports: {
      origin: '',
      portOfDischarge: '',
      finalDestination: '',
      placeOfReceipt: '',
      transhipmentPort: '',
    },
    cargoDetails: {
      commodity: '',
      incoterms: 'FOB',
      packingType: 'Container',
      weightUnit: 'KG',
      volumeUnit: 'CBM',
      isBooked: false,
      pieces: undefined,
      weight: undefined,
      volume: undefined,
    },
    vesselAndVoyage: {
        vesselName: '',
        voyageNumber: '',
        feederVesselName: '',
        feederVoyageNumber: '',
    },
    shipmentTerms: {
        freightTerms: 'Prepaid',
        blType: 'Original',
        shippingLine: '',
        nominationAgent: '',
        serviceType: '',
    },
    documents: {
        hbl: '',
        mbl: '',
        siCutOff: undefined,
        vgmCutOff: undefined,
        cooRequired: false,
        insuranceRequired: false,
    },
    status: 'Draft',
    createdBy: 'current_user_mock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    draftTimestamp: undefined,
    carrierBookingNumber: '',
    fileNumber: '',
    customerReference: '',
    importDeclarationNumber: '',
    internalRemarks: '',
    operationsExecutive: '',
    externalRemarks: '',
    statusTagOffice: '',
    statusTagTransporter: '',
    transporter: '',
    coloadedType: 'NotColoaded',
  };


interface SIJobFormProps {
  action: 'new' | 'edit';
  initialData?: SIJob | null;
}

const DRAFT_EXPIRATION_DAYS = 7;
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export function SIJobForm({ action, initialData }: SIJobFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = action === 'edit';
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting, isDirty }, reset, setValue, watch, getValues } = useForm<SIJob>({
    resolver: zodResolver(siJobSchema),
    defaultValues: defaultValues,
  });

  const draftKey = isEditMode && initialData?.id
    ? `si_job_draft_EDIT_${initialData.id}`
    : `si_job_draft_NEW`;

  // Load draft or initialData on mount
  useEffect(() => {
    const storedDraftRaw = localStorage.getItem(draftKey);
    let draftLoaded = false;
    if (storedDraftRaw) {
      try {
        const draftJob = JSON.parse(storedDraftRaw) as SIJob;
        if (draftJob.draftTimestamp && isValid(parseISO(draftJob.draftTimestamp))) {
          const draftAgeDays = differenceInDays(new Date(), parseISO(draftJob.draftTimestamp));
          if (draftAgeDays < DRAFT_EXPIRATION_DAYS) {
            reset(draftJob);
            toast({ title: "Draft Loaded", description: `Resumed editing draft for job ${draftJob.jobNumber}.`, variant: "default" });
            draftLoaded = true;
          } else {
            localStorage.removeItem(draftKey);
            toast({ title: "Expired Draft Discarded", description: `Previous draft was older than ${DRAFT_EXPIRATION_DAYS} days and has been discarded.`, variant: "default", className: "bg-yellow-500 text-black" });
          }
        }
      } catch (e) {
        console.error("Error parsing draft from localStorage:", e);
        localStorage.removeItem(draftKey);
      }
    }

    if (!draftLoaded) {
      if (isEditMode && initialData) {
        const mergedData = { ...defaultValues, ...initialData };
        reset(mergedData);
      } else if (!isEditMode) {
        reset(defaultValues);
      }
    }
  }, [action, initialData, reset, toast, draftKey, isEditMode]);


  const selectedCustomerName = watch('customer.name');
  useEffect(() => {
    if (selectedCustomerName) {
      const customer = mockCustomers.find(c => c.name === selectedCustomerName);
      if (customer) {
        setValue('customer.code', customer.code, { shouldValidate: true });
      }
    }
  }, [selectedCustomerName, setValue]);


  const performSave = async (data: SIJob, saveType: 'full' | 'draft') => {
    setIsLoading(true);
    console.log(`Performing save. Type: ${saveType}, Data:`, data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (saveType === 'draft') {
        const draftData: SIJob = {
          ...data,
          status: 'Draft',
          draftTimestamp: new Date().toISOString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
        toast({ title: 'Draft Saved!', description: `Job draft "${draftData.jobNumber}" saved locally.`, className: 'bg-blue-500 text-white' });
      } else { // 'full' save
        let currentJobs: SIJob[] = [];
        try {
          const storedJobsRaw = localStorage.getItem('si_jobs_mock');
          if (storedJobsRaw) currentJobs = JSON.parse(storedJobsRaw);
        } catch (error) {
          console.error("Failed to parse jobs from localStorage", error);
          toast({ title: "Storage Error", description: "Could not read existing jobs. Your save may overwrite data.", variant: "destructive"});
        }
        
        const finalData: SIJob = {
          ...data,
          status: isEditMode ? data.status : 'Submitted',
          updatedAt: new Date().toISOString(),
          draftTimestamp: undefined, // Remove draft timestamp on full save
          cargoDetails: {
            ...(data.cargoDetails || {}),
            isBooked: (data.status === 'Booted' || data.status === 'Submitted'),
          }
        };

        if (isEditMode && finalData.id) {
          const jobIndex = currentJobs.findIndex(j => j.id === finalData.id);
          if (jobIndex > -1) {
            currentJobs[jobIndex] = finalData;
          } else {
            currentJobs.push(finalData); // Fallback: if not found, add it
          }
          toast({ title: 'Job Updated!', description: `Job "${finalData.jobNumber}" updated successfully.`, className: 'bg-green-500 text-white' });
        } else {
          const newJobWithId: SIJob = {
             ...finalData, 
             id: `mock_si_${Date.now()}`,
             createdAt: new Date().toISOString()
          };
          currentJobs.push(newJobWithId);
          toast({ title: 'Job Created!', description: `New job "${newJobWithId.jobNumber}" created.`, className: 'bg-green-500 text-white' });
        }

        localStorage.setItem('si_jobs_mock', JSON.stringify(currentJobs));
        localStorage.removeItem(draftKey);

        router.push('/dashboard/sea-import/si-job');
      }
    } catch (error) {
      console.error("Error during save operation:", error);
      toast({ title: `Error Saving ${saveType === 'full' ? 'Job' : 'Draft'}`, description: `Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (data: SIJob) => {
    performSave(data, 'full');
  };
  
  const onFormError = (formErrors: any) => {
    console.error("Form validation errors:", formErrors);
    toast({
        title: "Validation Error",
        description: "Please check the form for errors. Required fields are marked with *.",
        variant: "destructive"
    });
  };

  const handleSaveDraftButton = () => {
    handleSubmit(
      (data) => performSave(data, 'draft'),
      () => toast({title: "Cannot Save Draft", description: "Please correct form errors before saving draft.", variant: "destructive"})
    )();
  };
  
  // Auto-save logic
  useEffect(() => {
    if (isDirty) {
      const interval = setInterval(() => {
        const currentValues = getValues();
        localStorage.setItem(draftKey, JSON.stringify({
          ...currentValues,
          draftTimestamp: new Date().toISOString()
        }));
        console.log("Auto-saved draft for key:", draftKey);
      }, AUTOSAVE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isDirty, getValues, draftKey]);

  const handleCopyJob = () => {
    const currentValues = getValues();
    const newJobNumber = `SIJ-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    reset({
      ...currentValues,
      id: undefined,
      jobNumber: newJobNumber,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draftTimestamp: new Date().toISOString(),
      documents: { ...(currentValues.documents || {}), hbl: '', mbl: '' },
      carrierBookingNumber: '',
    });
    toast({ title: "Job Copied as New Draft", description: `Data copied to new job: ${newJobNumber}. Review and save.`});
  };

  const renderDatePicker = (fieldName: keyof SIJob['dates'] | 'siCutOff' | 'vgmCutOff', label: string) => {
    const namePath = fieldName === 'siCutOff' || fieldName === 'vgmCutOff' ? `documents.${fieldName}` : `dates.${fieldName}`;
    return (
      <div>
        <Label htmlFor={namePath}>{label}</Label>
        <Controller
          name={namePath as any}
          control={control}
          render={({ field, fieldState }) => (
            <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value && isValid(parseISO(field.value)) ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value && isValid(parseISO(field.value)) ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus />
              </PopoverContent>
            </Popover>
            {fieldState.error && <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>}
            </>
          )}
        />
      </div>
    );
  };
  
  const generateSection = (title: string, IconComponent: React.ElementType, children: React.ReactNode) => (
    <div className="space-y-6 border-t pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-xl font-semibold text-primary flex items-center gap-2 mb-4">
        <IconComponent className="h-6 w-6" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 p-4 border rounded-md bg-card shadow-sm">
        {children}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl mb-10">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-foreground font-headline">
                {isEditMode ? `Edit SI Job: ${watch('jobNumber') || ''}` : 'New Sea Import Job'}
                </CardTitle>
                <CardDescription>
                {isEditMode ? 'Update details for this sea import job.' : 'Fill in the form to create a new sea import job.'}
                </CardDescription>
            </div>
            <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handleCopyJob} size="sm" disabled={isSubmitting || isLoading}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
            </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onFormSubmit, onFormError)}>
        <CardContent className="space-y-10 p-6">
          {generateSection("Basic Info", Briefcase, (
            <>
              {renderDatePicker('jobDate', 'Job Date*')}
              <div><Label htmlFor="jobBookingType">Job Booking Type*</Label><Controller name="jobBookingType" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{jobBookingTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>)} />{errors.jobBookingType && <p className="text-red-500 text-xs mt-1">{errors.jobBookingType.message}</p>}</div>
              <div><Label htmlFor="jobSubType">Job Sub Type*</Label><Controller name="jobSubType" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{jobSubTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>)} />{errors.jobSubType && <p className="text-red-500 text-xs mt-1">{errors.jobSubType.message}</p>}</div>
              <div><Label>DG/NonDG*</Label><Controller name="dangerousGoods" control={control} render={({ field }) => (<RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 mt-2">{dangerousGoodsOptions.map(opt => (<div key={opt} className="flex items-center space-x-2"><RadioGroupItem value={opt} id={`dg-${opt}`} /><Label htmlFor={`dg-${opt}`} className="font-normal">{opt}</Label></div>))}</RadioGroup>)} />{errors.dangerousGoods && <p className="text-red-500 text-xs mt-1">{errors.dangerousGoods.message}</p>}</div>
              <div><Label htmlFor="costCenter">Cost Center*</Label><Controller name="costCenter" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockCostCenters.map(cc => <SelectItem key={cc.id} value={cc.name}>{cc.name}</SelectItem>)}</SelectContent></Select>)} />{errors.costCenter && <p className="text-red-500 text-xs mt-1">{errors.costCenter.message}</p>}</div>
              <div><Label htmlFor="importDeclarationNumber">Import Declaration #</Label><Input id="importDeclarationNumber" {...register('importDeclarationNumber')} /></div>
              <div><Label htmlFor="fileNumber">File #</Label><Input id="fileNumber" {...register('fileNumber')} /></div>
            </>
          ))}
          {generateSection("Customer Details", Users, (
            <>
              <div><Label htmlFor="customer.name">Customer*</Label><Controller name="customer.name" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value || ''}><SelectTrigger><SelectValue placeholder="Select customer"/></SelectTrigger><SelectContent>{mockCustomers.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>)} />{errors.customer?.name && <p className="text-red-500 text-xs mt-1">{errors.customer.name.message}</p>}</div>
              <div><Label htmlFor="customer.code">Customer Code*</Label><Input id="customer.code" {...register('customer.code')} readOnly className="bg-muted/50"/>{errors.customer?.code && <p className="text-red-500 text-xs mt-1">{errors.customer.code.message}</p>}</div>
              <div><Label htmlFor="customerReference">Customer Ref</Label><Input id="customerReference" {...register('customerReference')} /></div>
              <div><Label htmlFor="salesRepresentative">Sales Rep*</Label><Controller name="salesRepresentative" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value || ''}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockStaff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select>)} />{errors.salesRepresentative && <p className="text-red-500 text-xs mt-1">{errors.salesRepresentative.message}</p>}</div>
              <div className="flex items-center space-x-2 pt-5"><Controller name="hasQuotation" control={control} render={({ field }) => (<Checkbox id="hasQuotation" checked={!!field.value} onCheckedChange={field.onChange} />)} /><Label htmlFor="hasQuotation" className="font-normal">Quotation Attached</Label></div>
            </>
          ))}
          {/* Other sections would be cloned similarly */}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-3 p-6 border-t sticky bottom-0 bg-background z-10">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting || isLoading}>Cancel</Button>
          <Button type="button" variant="secondary" onClick={handleSaveDraftButton} disabled={isSubmitting || isLoading}>{isLoading && !isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bookmark className="mr-2 h-4 w-4" />} Save Draft</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || isLoading}>
            {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditMode ? 'Saving...' : 'Creating...'}</>) : (<><Save className="mr-2 h-4 w-4" />{isEditMode ? 'Save Changes' : 'Create Job'}</>)}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
