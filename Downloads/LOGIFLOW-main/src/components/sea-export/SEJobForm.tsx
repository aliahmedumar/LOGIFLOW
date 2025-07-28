
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { seJobSchema, type SEJob, type SEJobStatus } from '@/lib/schemas/seaExportSchema';
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
  { name: 'OCEANWIDE EXPORTS', code: 'CUST004' },
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


const defaultValues: SEJob = {
    id: undefined,
    jobNumber: `SEJ-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
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
    internalRemarks: '',
    operationsExecutive: '',
    externalRemarks: '',
    statusTagOffice: '',
    statusTagTransporter: '',
    transporter: '',
    coloadedType: 'NotColoaded',
  };


interface SEJobFormProps {
  action: 'new' | 'edit';
  initialData?: SEJob | null;
}

const DRAFT_EXPIRATION_DAYS = 7;
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export function SEJobForm({ action, initialData }: SEJobFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = action === 'edit';
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting, isDirty }, reset, setValue, watch, getValues } = useForm<SEJob>({
    resolver: zodResolver(seJobSchema),
    defaultValues: defaultValues,
  });

  const draftKey = isEditMode && initialData?.id
    ? `se_job_draft_EDIT_${initialData.id}`
    : `se_job_draft_NEW`;

  // Load draft or initialData on mount
  useEffect(() => {
    const storedDraftRaw = localStorage.getItem(draftKey);
    let draftLoaded = false;
    if (storedDraftRaw) {
      try {
        const draftJob = JSON.parse(storedDraftRaw) as SEJob;
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


  const performSave = async (data: SEJob, saveType: 'full' | 'draft') => {
    setIsLoading(true);
    console.log(`Performing save. Type: ${saveType}, Data:`, data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (saveType === 'draft') {
        const draftData: SEJob = {
          ...data,
          status: 'Draft',
          draftTimestamp: new Date().toISOString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
        toast({ title: 'Draft Saved!', description: `Job draft "${draftData.jobNumber}" saved locally.`, className: 'bg-blue-500 text-white' });
      } else { // 'full' save
        let currentJobs: SEJob[] = [];
        try {
          const storedJobsRaw = localStorage.getItem('se_jobs_mock');
          if (storedJobsRaw) currentJobs = JSON.parse(storedJobsRaw);
        } catch (error) {
          console.error("Failed to parse jobs from localStorage", error);
          toast({ title: "Storage Error", description: "Could not read existing jobs. Your save may overwrite data.", variant: "destructive"});
        }
        
        const finalData: SEJob = {
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
          const newJobWithId: SEJob = {
             ...finalData, 
             id: `mock_${Date.now()}`,
             createdAt: new Date().toISOString()
          };
          currentJobs.push(newJobWithId);
          toast({ title: 'Job Created!', description: `New job "${newJobWithId.jobNumber}" created.`, className: 'bg-green-500 text-white' });
        }

        localStorage.setItem('se_jobs_mock', JSON.stringify(currentJobs));
        localStorage.removeItem(draftKey);

        router.push('/dashboard/sea-export/se-job');
      }
    } catch (error) {
      console.error("Error during save operation:", error);
      toast({ title: `Error Saving ${saveType === 'full' ? 'Job' : 'Draft'}`, description: `Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (data: SEJob) => {
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
    const newJobNumber = `SEJ-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
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

  const renderDatePicker = (fieldName: keyof SEJob['dates'] | 'siCutOff' | 'vgmCutOff', label: string) => {
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
                {isEditMode ? `Edit SE Job: ${watch('jobNumber') || ''}` : 'New Sea Export Job'}
                </CardTitle>
                <CardDescription>
                {isEditMode ? 'Update details for this sea export job.' : 'Fill in the form to create a new sea export job.'}
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
              <div><Label htmlFor="carrierBookingNumber">Carrier Booking #</Label><Input id="carrierBookingNumber" {...register('carrierBookingNumber')} /></div>
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
          {generateSection("Origin & Destination", Route, (
            <>
              <div className="lg:col-span-1 space-y-4"><h4 className="font-medium text-muted-foreground border-b pb-1 mb-3">ORIGIN</h4><div><Label htmlFor="ports.placeOfReceipt">Place Of Receipt</Label><Input id="ports.placeOfReceipt" {...register('ports.placeOfReceipt')} placeholder="e.g., Factory XYZ" /></div><div><Label htmlFor="ports.origin">Port of Loading*</Label><Input id="ports.origin" {...register('ports.origin')} placeholder="e.g., KARACHI" />{errors.ports?.origin && <p className="text-red-500 text-xs mt-1">{errors.ports.origin.message}</p>}</div>{renderDatePicker('por', 'POR Date*')}</div>
              <div className="lg:col-span-1 space-y-4"><h4 className="font-medium text-muted-foreground border-b pb-1 mb-3">DESTINATION</h4><div><Label htmlFor="ports.portOfDischarge">Port of Discharge*</Label><Input id="ports.portOfDischarge" {...register('ports.portOfDischarge')} placeholder="e.g., JEBEL ALI" />{errors.ports?.portOfDischarge && <p className="text-red-500 text-xs mt-1">{errors.ports.portOfDischarge.message}</p>}</div><div><Label htmlFor="ports.finalDestination">Final Destination*</Label><Input id="ports.finalDestination" {...register('ports.finalDestination')} placeholder="e.g., DUBAI WAREHOUSE" />{errors.ports?.finalDestination && <p className="text-red-500 text-xs mt-1">{errors.ports.finalDestination.message}</p>}</div>{renderDatePicker('eta', 'ETA Date*')}</div>
              <div className="lg:col-span-1 space-y-4"><h4 className="font-medium text-muted-foreground border-b pb-1 mb-3">DATES & OTHER</h4>{renderDatePicker('cutOff', 'Vessel Cut-Off Date*')}<div><Label htmlFor="ports.transhipmentPort">Transhipment Port</Label><Input id="ports.transhipmentPort" {...register('ports.transhipmentPort')} /></div></div>
            </>
          ))}
          {generateSection("Cargo Details", PackageSearch, (
            <>
              <div><Label htmlFor="cargoDetails.commodity">Commodity*</Label><Input id="cargoDetails.commodity" {...register('cargoDetails.commodity')} />{errors.cargoDetails?.commodity && <p className="text-red-500 text-xs mt-1">{errors.cargoDetails.commodity.message}</p>}</div>
              <div><Label htmlFor="cargoDetails.incoterms">Inco Terms*</Label><Controller name="cargoDetails.incoterms" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{incotermsOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>)} />{errors.cargoDetails?.incoterms && <p className="text-red-500 text-xs mt-1">{errors.cargoDetails.incoterms.message}</p>}</div>
              <div><Label htmlFor="cargoDetails.pieces">Pcs</Label><Input id="cargoDetails.pieces" type="number" {...register('cargoDetails.pieces', { setValueAs: (v) => v === '' || v === null ? undefined : parseInt(v, 10) })} />{errors.cargoDetails?.pieces && <p className="text-red-500 text-xs mt-1">{errors.cargoDetails.pieces.message}</p>}</div>
              <div><Label htmlFor="cargoDetails.packingType">Packing Type*</Label><Controller name="cargoDetails.packingType" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{packingTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>)} />{errors.cargoDetails?.packingType && <p className="text-red-500 text-xs mt-1">{errors.cargoDetails.packingType.message}</p>}</div>
              <div><Label htmlFor="cargoDetails.weight">Weight*</Label><div className="flex space-x-2"><Input id="cargoDetails.weight" type="number" step="any" className="flex-grow" {...register('cargoDetails.weight', { setValueAs: (v) => v === '' || v === null ? undefined : parseFloat(v) })} /><Controller name="cargoDetails.weightUnit" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger><SelectContent>{weightUnitOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>)} /></div>{errors.cargoDetails?.weight && <p className="text-red-500 text-xs mt-1">{errors.cargoDetails.weight.message}</p>}{errors.cargoDetails?.weightUnit && <p className="text-red-500 text-xs mt-1">{errors.cargoDetails.weightUnit.message}</p>}</div>
              <div><Label htmlFor="cargoDetails.volume">Volume</Label><div className="flex space-x-2"><Input id="cargoDetails.volume" type="number" step="any" className="flex-grow" {...register('cargoDetails.volume', { setValueAs: (v) => v === '' || v === null ? undefined : parseFloat(v) })} /><Controller name="cargoDetails.volumeUnit" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger><SelectContent>{volumeUnitOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>)} /></div>{errors.cargoDetails?.volume && <p className="text-red-500 text-xs mt-1">{errors.cargoDetails.volume.message}</p>}{errors.cargoDetails?.volumeUnit && <p className="text-red-500 text-xs mt-1">{errors.cargoDetails.volumeUnit.message}</p>}</div>
              {(watch("status") === 'Booted' || watch("status") === 'Submitted') && watch("cargoDetails.isBooked") && (<div className="lg:col-span-full flex items-center justify-center"><Badge className="bg-green-500 text-white text-sm px-3 py-1">Cargo Booked</Badge></div>)}
            </>
          ))}
          {generateSection("Vessel & Voyage", Ship, (
            <>
              <div><Label htmlFor="vesselAndVoyage.vesselName">Vessel Name</Label><Input id="vesselAndVoyage.vesselName" {...register('vesselAndVoyage.vesselName')} /></div>
              <div><Label htmlFor="vesselAndVoyage.voyageNumber">Voyage No.</Label><Input id="vesselAndVoyage.voyageNumber" {...register('vesselAndVoyage.voyageNumber')} /></div>
              {renderDatePicker('etd', 'ETD Date')}
              {renderDatePicker('arrivalDate', 'Arrival Date')}
              <div><Label htmlFor="vesselAndVoyage.feederVesselName">Feeder Vessel</Label><Input id="vesselAndVoyage.feederVesselName" {...register('vesselAndVoyage.feederVesselName')} /></div>
              <div><Label htmlFor="vesselAndVoyage.feederVoyageNumber">Feeder Voyage No.</Label><Input id="vesselAndVoyage.feederVoyageNumber" {...register('vesselAndVoyage.feederVoyageNumber')} /></div>
            </>
          ))}
          {generateSection("Shipment Terms", Settings, (
            <>
              <div><Label htmlFor="shipmentTerms.shippingLine">Shipping Line / Agent</Label><Input id="shipmentTerms.shippingLine" {...register('shipmentTerms.shippingLine')} /></div>
              <div><Label htmlFor="shipmentTerms.nominationAgent">Nomination Agent</Label><Input id="shipmentTerms.nominationAgent" {...register('shipmentTerms.nominationAgent')} /></div>
              <div><Label htmlFor="shipmentTerms.freightTerms">Freight Terms</Label><Controller name="shipmentTerms.freightTerms" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(['Prepaid', 'Collect', 'Third Party'] as const).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>)} /></div>
              <div><Label htmlFor="shipmentTerms.serviceType">Service Type</Label><Input id="shipmentTerms.serviceType" {...register('shipmentTerms.serviceType')} placeholder="e.g., Port to Port"/></div>
              <div><Label htmlFor="shipmentTerms.blType">B/L Type</Label><Controller name="shipmentTerms.blType" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(['Original', 'Seaway', 'Telex Release'] as const).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>)} /></div>
            </>
          ))}
          {generateSection("Documents", FileText, (
            <>
              <div><Label htmlFor="documents.hbl">HBL No.</Label><Input id="documents.hbl" {...register('documents.hbl')} /></div>
              <div><Label htmlFor="documents.mbl">MBL No.</Label><Input id="documents.mbl" {...register('documents.mbl')} /></div>
              {renderDatePicker('siCutOff' as any, 'SI Cut-Off Date')}
              {renderDatePicker('vgmCutOff' as any, 'VGM Cut-Off Date')}
              <div className="flex items-center space-x-2 pt-2"><Controller name="documents.cooRequired" control={control} render={({ field }) => (<Checkbox id="documents.cooRequired" checked={!!field.value} onCheckedChange={field.onChange} />)} /><Label htmlFor="documents.cooRequired" className="font-normal">COO Required</Label></div>
              <div className="flex items-center space-x-2 pt-2"><Controller name="documents.insuranceRequired" control={control} render={({ field }) => (<Checkbox id="documents.insuranceRequired" checked={!!field.value} onCheckedChange={field.onChange} />)} /><Label htmlFor="documents.insuranceRequired" className="font-normal">Insurance Required</Label></div>
            </>
          ))}
          {generateSection("Charges", DollarSign, (
            <p className="text-muted-foreground md:col-span-full lg:col-span-full">Charges grid and currency conversion will be implemented here.</p>
          ))}
          {generateSection("Internal Details", Info, (
            <>
              <div className="lg:col-span-1 md:col-span-1"><Label htmlFor="internalRemarks">Internal Remarks</Label><Textarea id="internalRemarks" {...register('internalRemarks')} rows={3} /></div>
              <div className="lg:col-span-1 md:col-span-1"><Label htmlFor="operationsExecutive">Operations Executive</Label><Controller name="operationsExecutive" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value || ''}><SelectTrigger><SelectValue placeholder="Select Ops Exec" /></SelectTrigger><SelectContent>{mockStaff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select>)} /></div>
              <div className="lg:col-span-1 md:col-span-1"><Label htmlFor="status">Job Status*</Label><Controller name="status" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{jobStatusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>)} />{errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}</div>
              <div><Label htmlFor="statusTagOffice">Status Tag (Office)</Label><Input id="statusTagOffice" {...register('statusTagOffice')} /></div>
              <div><Label htmlFor="statusTagTransporter">Status Tag (Transporter)</Label><Input id="statusTagTransporter" {...register('statusTagTransporter')} /></div>
              <div><Label htmlFor="transporter">Transporter</Label><Input id="transporter" {...register('transporter')} /></div>
              <div><Label htmlFor="coloadedType">Coloaded Type</Label><Controller name="coloadedType" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="coloadedType"><SelectValue placeholder="Select coloaded type" /></SelectTrigger><SelectContent><SelectItem value="NotColoaded">Not Coloaded</SelectItem><SelectItem value="Nanoe">Nanoe</SelectItem><SelectItem value="LCL">LCL</SelectItem></SelectContent></Select>)} /></div>
            </>
          ))}
          {generateSection("Remarks", StickyNote, (
            <div className="lg:col-span-full"><Label htmlFor="externalRemarks">External Remarks (for B/L, Customer)</Label><Textarea id="externalRemarks" {...register('externalRemarks')} rows={4} /></div>
          ))}
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
