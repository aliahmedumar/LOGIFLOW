// src/components/sea-export/CROForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { croSchema, type CRO } from '@/lib/schemas/croSchema';
import type { SEJob } from '@/lib/schemas/seaExportSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Save, Loader2, Info, Users, Route, Ship, FileText, Settings, Truck } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data for dropdowns
const mockAgents = [
  { id: 'agent001', name: 'Global Agents Inc.' },
  { id: 'agent002', name: 'APAC Logistics' },
  { id: 'agent003', name: 'Euro Liners GmbH' },
];
const mockClearingAgents = [
    { id: 'ca001', name: 'Speedy Customs Brokers' },
    { id: 'ca002', name: 'ClearFast Solutions' },
];
const mockTransporters = [
  { id: 'tran001', name: 'Elite Transports' },
  { id: 'tran002', name: 'Speedy Logistics' },
];
const mockTerminals = ['Terminal A', 'Terminal B', 'Terminal C'];
const mockEmptyDepots = ['Depot 1', 'Depot 2', 'Depot 3'];
const mockSiteTypes = ['Factory', 'Warehouse', 'Port'];


const defaultValues: CRO = {
  id: undefined,
  croNo: `CRO-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
  status: 'Draft',
  croType: 'Against Job/Booking',
  jobRef: '',
  client: undefined,
  equipQty: 1,
  siteType: undefined,
  issueDate: new Date().toISOString(),
  validForDays: 7,
  refNo: undefined,
  parties: {
    overseasAgent: undefined,
    clearingAgent: undefined,
    shipper: undefined,
  },
  pickupLocation: undefined,
  routing: {
    portOfLoading: undefined,
    portOfDischarge: undefined,
    finalDestination: undefined,
    commodity: undefined,
  },
  logistics: {
    terminal: undefined,
    emptyDepot: undefined,
    transporter: undefined,
  },
  cargoType: 'General',
  vesselInfo: {
    vessel: undefined,
    voyage: undefined,
    sailingDate: undefined,
  },
  actions: {
    manual: false,
    printLogo: true,
    continueMode: false,
  },
  createdAt: undefined,
  updatedAt: undefined,
};

interface CROFormProps {
  action: 'new' | 'edit';
  initialData?: CRO | null;
  seJobs: SEJob[];
}

export function CROForm({ action, initialData, seJobs }: CROFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = action === 'edit';
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<CRO>({
    resolver: zodResolver(croSchema),
    defaultValues: initialData ? { ...defaultValues, ...initialData } : defaultValues,
  });

  const selectedJobRef = watch('jobRef');
  useEffect(() => {
    if (selectedJobRef) {
      const selectedJob = seJobs.find(job => job.jobNumber === selectedJobRef);
      if (selectedJob) {
        setValue('client', selectedJob.customer.name);
        setValue('parties.shipper', selectedJob.customer.name);
        setValue('routing.portOfLoading', selectedJob.ports.origin);
        setValue('routing.portOfDischarge', selectedJob.ports.portOfDischarge);
        setValue('routing.finalDestination', selectedJob.ports.finalDestination);
        setValue('routing.commodity', selectedJob.cargoDetails.commodity);
        setValue('vesselInfo.vessel', selectedJob.vesselAndVoyage?.vesselName);
        setValue('vesselInfo.voyage', selectedJob.vesselAndVoyage?.voyageNumber);
        if (selectedJob.dates.etd) {
           setValue('vesselInfo.sailingDate', selectedJob.dates.etd);
        }
      }
    }
  }, [selectedJobRef, seJobs, setValue]);
  

  const onFormError = (errors: any) => {
    console.error("CRO Form Validation Errors:", errors);
    toast({
      title: "Validation Error",
      description: "Please check the form for errors. Required fields must be filled correctly.",
      variant: "destructive",
    });
  };

  const onSubmit = async (data: CRO) => {
    setIsLoading(true);
    console.log("Submitting CRO data:", data);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    try {
        let currentCros: CRO[] = [];
        const storedCrosRaw = localStorage.getItem('cro_orders_mock');
        if (storedCrosRaw) {
            try {
                currentCros = JSON.parse(storedCrosRaw);
            } catch (e) {
                console.error("Failed to parse existing CROs from localStorage", e);
                toast({ title: 'Storage Error', description: 'Could not read existing CROs, save might overwrite data.', variant: 'destructive' });
            }
        }

        if (isEditMode && data.id) {
            const finalData = { ...data, updatedAt: new Date().toISOString() };
            const croIndex = currentCros.findIndex(c => c.id === finalData.id);
            if (croIndex > -1) {
                currentCros[croIndex] = finalData;
            } else {
                currentCros.push(finalData); // Fallback if not found
            }
            toast({ title: 'CRO Updated!', description: `CRO "${finalData.croNo}" updated successfully.`, className: 'bg-green-500 text-white' });
        } else {
            // Logic for creating a new CRO
            const newCroData: CRO = {
                ...data,
                id: `cro_mock_${Date.now()}`,
                status: 'Issued', // Explicitly set status on creation
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            currentCros.push(newCroData);
            toast({ title: 'CRO Created!', description: `New CRO "${newCroData.croNo}" has been issued.`, className: 'bg-green-500 text-white' });
        }
        
        localStorage.setItem('cro_orders_mock', JSON.stringify(currentCros));
        router.push('/dashboard/sea-export/cro');

    } catch (error) {
      console.error("Error during save operation:", error);
      toast({ title: 'Error Saving CRO', description: `Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDatePicker = (fieldName: keyof CRO | 'vesselInfo.sailingDate', label: string) => {
    return (
      <div>
        <Label htmlFor={fieldName}>{label}</Label>
        <Controller
          name={fieldName as any}
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value && isValid(parseISO(field.value)) ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus /></PopoverContent>
            </Popover>
          )}
        />
      </div>
    );
  };
  
  const generateSection = (title: string, IconComponent: React.ElementType, children: React.ReactNode) => (
    <div className="space-y-6 border-t pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-xl font-semibold text-primary flex items-center gap-2 mb-4">
        <IconComponent className="h-6 w-6" /> {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 p-4 border rounded-md bg-card shadow-sm">
        {children}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl mb-10">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground font-headline">
          {isEditMode ? `Edit CRO: ${watch('croNo')}` : 'New Container Release Order'}
        </CardTitle>
        <CardDescription>{isEditMode ? 'Update details for this CRO.' : 'Fill in the form to create a new CRO.'}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit, onFormError)}>
        <CardContent className="space-y-10 p-6">
          {generateSection("Basic Info", Info, (
            <>
              <div><Label htmlFor="croType">CRO Type*</Label><Controller name="croType" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Against Job/Booking">Against Job/Booking</SelectItem><SelectItem value="Standalone">Standalone</SelectItem></SelectContent></Select>)} />{errors.croType && <p className="text-red-500 text-xs mt-1">{errors.croType.message}</p>}</div>
              <div><Label htmlFor="jobRef">Job#*</Label><Controller name="jobRef" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select a job"/></SelectTrigger><SelectContent>{seJobs.map(job => <SelectItem key={job.id!} value={job.jobNumber}>{job.jobNumber} - {job.customer.name}</SelectItem>)}</SelectContent></Select>)} />{errors.jobRef && <p className="text-red-500 text-xs mt-1">{errors.jobRef.message}</p>}</div>
              <div><Label htmlFor="client">Client</Label><Input id="client" {...register('client')} readOnly className="bg-muted/50"/></div>
              <div><Label htmlFor="equipQty">Equip Qty*</Label><Input id="equipQty" type="number" {...register('equipQty', { setValueAs: v => parseInt(v, 10) })} />{errors.equipQty && <p className="text-red-500 text-xs mt-1">{errors.equipQty.message}</p>}</div>
              <div><Label htmlFor="siteType">Site Type</Label><Controller name="siteType" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mockSiteTypes.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent></Select>)} /></div>
            </>
          ))}
          {generateSection("Dates & Reference", CalendarIcon, (
            <>
              {renderDatePicker('issueDate', 'Issue Date*')}
              <div><Label htmlFor="validForDays">CRO Valid For*</Label><div className="flex items-center gap-2"><Input id="validForDays" type="number" {...register('validForDays', {setValueAs: v => parseInt(v, 10)})} className="flex-1" /><span className="text-sm text-muted-foreground">days</span></div>{errors.validForDays && <p className="text-red-500 text-xs mt-1">{errors.validForDays.message}</p>}</div>
              <div><Label htmlFor="refNo">Ref No</Label><Input id="refNo" {...register('refNo')} /></div>
            </>
          ))}
          {generateSection("Parties", Users, (
            <>
                <div><Label htmlFor="parties.overseasAgent">Overseas Agent</Label><Controller name="parties.overseasAgent" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mockAgents.map(a => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}</SelectContent></Select>)} /></div>
                <div><Label htmlFor="parties.clearingAgent">Clearing Agent</Label><Controller name="parties.clearingAgent" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mockClearingAgents.map(ca => <SelectItem key={ca.id} value={ca.name}>{ca.name}</SelectItem>)}</SelectContent></Select>)} /></div>
                <div><Label htmlFor="parties.shipper">Shipper</Label><Input id="parties.shipper" {...register('parties.shipper')} readOnly className="bg-muted/50"/></div>
                <div className="lg:col-span-3"><Label htmlFor="pickupLocation">Pickup Location</Label><Input id="pickupLocation" {...register('pickupLocation')} /></div>
            </>
          ))}
          {generateSection("Routing", Route, (
            <>
                <div><Label htmlFor="routing.portOfLoading">Port of Loading</Label><Input id="routing.portOfLoading" {...register('routing.portOfLoading')} readOnly className="bg-muted/50"/></div>
                <div><Label htmlFor="routing.portOfDischarge">Port of Discharge</Label><Input id="routing.portOfDischarge" {...register('routing.portOfDischarge')} readOnly className="bg-muted/50"/></div>
                <div><Label htmlFor="routing.finalDestination">Final Destination</Label><Input id="routing.finalDestination" {...register('routing.finalDestination')} readOnly className="bg-muted/50"/></div>
                <div className="lg:col-span-3"><Label htmlFor="routing.commodity">Commodity</Label><Input id="routing.commodity" {...register('routing.commodity')} readOnly className="bg-muted/50"/></div>
            </>
          ))}
           {generateSection("Logistics", Truck, (
            <>
              <div><Label htmlFor="logistics.terminal">Terminal</Label><Controller name="logistics.terminal" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mockTerminals.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>)} /></div>
              <div><Label htmlFor="logistics.emptyDepot">Empty Depot</Label><Controller name="logistics.emptyDepot" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mockEmptyDepots.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>)} /></div>
              <div><Label htmlFor="logistics.transporter">Transporter</Label><Controller name="logistics.transporter" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mockTransporters.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select>)} /></div>
              <div><Label>Cargo Type</Label><Controller name="cargoType" control={control} render={({ field }) => (<RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 mt-2"><RadioGroupItem value="General" id="cargo-general" /><Label htmlFor="cargo-general" className="font-normal">General</Label><RadioGroupItem value="Hazardous" id="cargo-hazardous" /><Label htmlFor="cargo-hazardous" className="font-normal">Hazardous</Label></RadioGroup>)} /></div>
            </>
          ))}
          {generateSection("Vessel Info", Ship, (
            <>
                <div><Label htmlFor="vesselInfo.vessel">Vessel</Label><Input id="vesselInfo.vessel" {...register('vesselInfo.vessel')} /></div>
                <div><Label htmlFor="vesselInfo.voyage">Voyage</Label><Input id="vesselInfo.voyage" {...register('vesselInfo.voyage')} /></div>
                {renderDatePicker('vesselInfo.sailingDate', 'Sailing Date')}
            </>
          ))}
          {generateSection("Actions", Settings, (
            <>
                <div className="flex items-center space-x-2"><Controller name="actions.manual" control={control} render={({ field }) => (<Checkbox id="actions.manual" checked={!!field.value} onCheckedChange={field.onChange} />)} /><Label htmlFor="actions.manual" className="font-normal">Manual</Label></div>
                <div className="flex items-center space-x-2"><Controller name="actions.printLogo" control={control} render={({ field }) => (<Checkbox id="actions.printLogo" checked={!!field.value} onCheckedChange={field.onChange} />)} /><Label htmlFor="actions.printLogo" className="font-normal">Print Logo</Label></div>
                <div className="flex items-center space-x-2"><Controller name="actions.continueMode" control={control} render={({ field }) => (<Checkbox id="actions.continueMode" checked={!!field.value} onCheckedChange={field.onChange} />)} /><Label htmlFor="actions.continueMode" className="font-normal">Continue Mode</Label></div>
            </>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end p-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting || isLoading} className="mr-2">Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditMode ? 'Save Changes' : 'Create CRO'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
