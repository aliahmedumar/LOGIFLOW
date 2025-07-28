
// src/components/air-export/AEJobForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aeJobSchema, type AEJob } from '@/lib/schemas/aeJobSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Save, Loader2, UserPlus, Info, Package, Plane, DollarSign, StickyNote, AlertTriangle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AEJobFormProps {
  action: 'new' | 'edit';
  initialData?: AEJob | null;
  mockCustomers: { name: string; code: string }[];
}

const defaultValues: AEJob = {
  basicInfo: { customerName: '' },
  cargo: { commodity: '' },
  transport: { airline: '', flightNumber: '', departureDateTime: '', arrivalDateTime: '' },
  charges: {},
  poDetails: {},
  status: 'Draft',
};

export function AEJobForm({ action, initialData, mockCustomers }: AEJobFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = action === 'edit';
  
  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch, trigger } = useForm<AEJob>({
    resolver: zodResolver(aeJobSchema),
    defaultValues: initialData || defaultValues,
  });

  const [weight, volume] = useWatch({ control, name: ["cargo.weight", "cargo.volume"] });

  useEffect(() => {
    const volWeight = (volume || 0) * 167; // IATA standard volumetric weight factor
    const grossWeight = weight || 0;
    const chargeableWeight = Math.max(grossWeight, volWeight);
    setValue('cargo.chargeableWeight', parseFloat(chargeableWeight.toFixed(2)));
  }, [weight, volume, setValue]);

  const onFormError = (formErrors: any) => {
    console.error("AE Job Form Validation Errors:", formErrors);
    toast({
      title: "Validation Error",
      description: "Please check all tabs for errors. Required fields are marked with *.",
      variant: "destructive",
    });
  };

  const onSubmit = (data: AEJob) => {
    let currentJobs: AEJob[] = [];
    const storedJobsRaw = localStorage.getItem('ae_jobs_mock');
    if (storedJobsRaw) {
      currentJobs = JSON.parse(storedJobsRaw);
    }
    
    if (isEditMode && data.id) {
      const finalData = { ...data, updatedAt: new Date().toISOString() };
      const jobIndex = currentJobs.findIndex(j => j.id === finalData.id);
      if (jobIndex > -1) currentJobs[jobIndex] = finalData;
      toast({ title: 'AE Job Updated!', className: 'bg-green-500 text-white' });
    } else {
      const newJobData: AEJob = {
        ...data,
        id: `ae_mock_${Date.now()}`,
        status: 'Booked',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      currentJobs.push(newJobData);
      toast({ title: 'AE Job Created!', className: 'bg-green-500 text-white' });
    }
    
    localStorage.setItem('ae_jobs_mock', JSON.stringify(currentJobs));
    router.push('/dashboard/air-export/ae-job');
  };

  const renderDatePicker = (fieldName: "cargo.pickupDate" | "cargo.dropOffDate" | "transport.departureDateTime" | "transport.arrivalDateTime", label: string) => (
    <div>
      <Label htmlFor={fieldName}>{label}</Label>
      <Controller name={fieldName} control={control} render={({ field }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus /></PopoverContent>
        </Popover>
      )} />
      {errors[fieldName.split('.')[0] as keyof AEJob]?.[fieldName.split('.')[1] as any] && <p className="text-red-500 text-xs mt-1">{(errors[fieldName.split('.')[0] as keyof AEJob]?.[fieldName.split('.')[1] as any] as any).message}</p>}
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl mb-10">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground font-headline">
          {isEditMode ? `Edit AE Job` : 'New Air Export Job'}
        </CardTitle>
        <CardDescription>{isEditMode ? 'Update job details.' : 'Fill in the form to create a new job.'}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit, onFormError)}>
        <CardContent className="p-0">
          <Tabs defaultValue="basic-info" className="w-full">
            <TabsList className="m-4 flex-wrap h-auto">
              <TabsTrigger value="basic-info"><Info className="mr-2 h-4 w-4"/>Basic Info</TabsTrigger>
              <TabsTrigger value="cargo-details"><Package className="mr-2 h-4 w-4"/>Cargo Details</TabsTrigger>
              <TabsTrigger value="transport"><Plane className="mr-2 h-4 w-4"/>Transport</TabsTrigger>
              <TabsTrigger value="charges"><DollarSign className="mr-2 h-4 w-4"/>Charges</TabsTrigger>
              <TabsTrigger value="po-details"><StickyNote className="mr-2 h-4 w-4"/>PO Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-info" className="p-6 border-t">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="basicInfo.customerName">Customer*</Label>
                  <div className="flex gap-2">
                    <Controller name="basicInfo.customerName" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                        <SelectContent>{mockCustomers.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                    <Button type="button" variant="outline" size="icon" onClick={() => alert("Quick-add customer modal placeholder.")}><UserPlus className="h-4 w-4" /></Button>
                  </div>
                  {errors.basicInfo?.customerName && <p className="text-red-500 text-xs mt-1">{errors.basicInfo.customerName.message}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cargo-details" className="p-6 border-t space-y-6">
              <div>
                <Label htmlFor="cargo.commodity">Commodity*</Label>
                <Input id="cargo.commodity" {...register('cargo.commodity')} />
                {errors.cargo?.commodity && <p className="text-red-500 text-xs mt-1">{errors.cargo.commodity.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="cargo.volume">Volume (CBM)</Label><Input type="number" step="any" {...register('cargo.volume', { setValueAs: v => v ? parseFloat(v) : undefined })} /></div>
                <div><Label htmlFor="cargo.weight">Weight (KG)</Label><Input type="number" step="any" {...register('cargo.weight', { setValueAs: v => v ? parseFloat(v) : undefined })} /></div>
                <div><Label htmlFor="cargo.chargeableWeight">Chargeable Weight (KG)</Label><Input id="cargo.chargeableWeight" {...register('cargo.chargeableWeight')} readOnly className="bg-muted/50" /></div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderDatePicker('cargo.pickupDate', 'Pickup Date')}
                <div><Label htmlFor="cargo.pickupLocation">Pickup Location</Label><Input id="cargo.pickupLocation" {...register('cargo.pickupLocation')} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderDatePicker('cargo.dropOffDate', 'Drop Off Date')}
                <div><Label htmlFor="cargo.returnTracking">Return Tracking</Label><Input id="cargo.returnTracking" {...register('cargo.returnTracking')} /></div>
              </div>
            </TabsContent>

            <TabsContent value="transport" className="p-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="transport.airline">Airline*</Label><Input {...register('transport.airline')} />{errors.transport?.airline && <p className="text-red-500 text-xs mt-1">{errors.transport.airline.message}</p>}</div>
              <div><Label htmlFor="transport.flightNumber">Flight#*</Label><Input {...register('transport.flightNumber')} />{errors.transport?.flightNumber && <p className="text-red-500 text-xs mt-1">{errors.transport.flightNumber.message}</p>}</div>
              {renderDatePicker('transport.departureDateTime', 'Departure Date/Time*')}
              {renderDatePicker('transport.arrivalDateTime', 'Arrival Date/Time*')}
            </TabsContent>

            <TabsContent value="charges" className="p-6 border-t">
              <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-md">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                <p>Charges calculation feature is currently in development.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="po-details" className="p-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="poDetails.poNumber">Purchase Order #</Label><Input id="poDetails.poNumber" {...register('poDetails.poNumber')} /></div>
              <div><Label htmlFor="poDetails.style">Style</Label><Input id="poDetails.style" {...register('poDetails.style')} /></div>
            </TabsContent>

          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end p-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} className="mr-2">Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="mr-2 h-4 w-4" />{isEditMode ? 'Save Changes' : 'Create AE Job'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
