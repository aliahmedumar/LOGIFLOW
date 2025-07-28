
// src/components/sea-import/SIBlForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siBlSchema, type SI_BL } from '@/lib/schemas/siBlSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Save, Loader2, FileText, Container, Stamp, Notebook, DollarSign } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface SIBlFormProps {
  action: 'new' | 'edit';
  initialData?: SI_BL | null;
}

const defaultValues: SI_BL = {
  id: undefined,
  blInfo: {
    jobRef: '',
    hblNo: `HBL-SI-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    customsMbl: '',
    supplier: '',
    consignee: '',
    vessel: '',
    voyageNo: '',
    sailingDate: new Date().toISOString(),
  },
  blDetail: {
    inVitro: {
      refHistory: "",
      testingNotes: "",
    },
    workflow: {
      purpose: 'Notify Party 1',
      partStatus: 'New',
    },
    compliance: {
      importType: 'Personal',
      hasMetClass: false,
      clientCount: 0,
      customsValue: undefined,
    }
  },
  containers: [],
  details: {},
  stamps: {},
  notes: '',
  status: 'draft',
  createdAt: undefined,
  updatedAt: undefined,
};

export function SIBlForm({ action, initialData }: SIBlFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = action === 'edit';
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm<SI_BL>({
    resolver: zodResolver(siBlSchema),
    defaultValues: initialData ? { 
      ...defaultValues, 
      ...initialData,
      blDetail: {
        ...defaultValues.blDetail,
        ...(initialData.blDetail || {})
      }
    } : defaultValues,
  });

  const onFormError = (errors: any) => {
    console.error("SI B/L Form Validation Errors:", errors);
    toast({
      title: "Validation Error",
      description: "Please check all tabs for errors. Required fields must be filled correctly.",
      variant: "destructive",
    });
  };

  const onSubmit = async (data: SI_BL) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let currentBls: SI_BL[] = [];
      const storedBlsRaw = localStorage.getItem('si_bl_mock');
      if (storedBlsRaw) {
        currentBls = JSON.parse(storedBlsRaw);
      }

      if (isEditMode && data.id) {
        const finalData = { ...data, updatedAt: new Date().toISOString() };
        const blIndex = currentBls.findIndex(bl => bl.id === finalData.id);
        if (blIndex > -1) {
          currentBls[blIndex] = finalData;
        }
        toast({ title: 'SI B/L Updated!', description: `B/L "${finalData.blInfo.hblNo}" updated.`, className: 'bg-green-500 text-white' });
      } else {
        const newBlData: SI_BL = {
          ...data,
          id: `si_bl_mock_${Date.now()}`,
          status: 'issued',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        currentBls.push(newBlData);
        toast({ title: 'SI B/L Created!', description: `New B/L "${newBlData.blInfo.hblNo}" issued.`, className: 'bg-green-500 text-white' });
      }
      
      localStorage.setItem('si_bl_mock', JSON.stringify(currentBls));
      router.push('/dashboard/sea-import/si-bl');

    } catch (error) {
      console.error("Error saving SI B/L:", error);
      toast({ title: 'Error Saving SI B/L', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl mb-10">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground font-headline">
          {isEditMode ? `Edit SI B/L: ${watch('blInfo.hblNo')}` : 'New SI Bill of Lading'}
        </CardTitle>
        <CardDescription>{isEditMode ? 'Update details for this B/L.' : 'Fill in the form to create a new B/L.'}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit, onFormError)}>
        <CardContent className="p-0">
          <Tabs defaultValue="bl-info" className="w-full">
            <TabsList className="m-4 flex-wrap h-auto">
              <TabsTrigger value="bl-info"><FileText className="mr-2 h-4 w-4"/>BL Info</TabsTrigger>
              <TabsTrigger value="bl-detail"><FileText className="mr-2 h-4 w-4"/>BL Detail</TabsTrigger>
              <TabsTrigger value="container-info" disabled><Container className="mr-2 h-4 w-4"/>Container Info</TabsTrigger>
              <TabsTrigger value="ref-stamp" disabled><Stamp className="mr-2 h-4 w-4"/>Ref No's/Stamp</TabsTrigger>
              <TabsTrigger value="tracing-notes" disabled><Notebook className="mr-2 h-4 w-4"/>Tracing Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bl-info" className="p-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div>
                  <Label htmlFor="blInfo.jobRef">Job#*</Label>
                  <Input id="blInfo.jobRef" placeholder="e.g. SIJ-25-1234" {...register('blInfo.jobRef')} />
                  {errors.blInfo?.jobRef && <p className="text-red-500 text-xs mt-1">{errors.blInfo.jobRef.message}</p>}
                </div>
                <div>
                  <Label htmlFor="blInfo.hblNo">HBL#*</Label>
                  <Input id="blInfo.hblNo" placeholder="e.g. HBL-SI-24-0001" {...register('blInfo.hblNo')} />
                  {errors.blInfo?.hblNo && <p className="text-red-500 text-xs mt-1">{errors.blInfo.hblNo.message}</p>}
                </div>
                <div>
                  <Label htmlFor="blInfo.customsMbl">Customs MBL#</Label>
                  <Input id="blInfo.customsMbl" placeholder="Enter customs MBL number" {...register('blInfo.customsMbl')} />
                  {errors.blInfo?.customsMbl && <p className="text-red-500 text-xs mt-1">{errors.blInfo.customsMbl.message}</p>}
                </div>
                <div>
                  <Label htmlFor="blInfo.supplier">Supplier*</Label>
                  <Input id="blInfo.supplier" placeholder="Enter supplier name" {...register('blInfo.supplier')} />
                  {errors.blInfo?.supplier && <p className="text-red-500 text-xs mt-1">{errors.blInfo.supplier.message}</p>}
                </div>
                 <div>
                  <Label htmlFor="blInfo.consignee">Consignee*</Label>
                  <Input id="blInfo.consignee" placeholder="Enter consignee name" {...register('blInfo.consignee')} />
                  {errors.blInfo?.consignee && <p className="text-red-500 text-xs mt-1">{errors.blInfo.consignee.message}</p>}
                </div>
                <div>
                  <Label htmlFor="blInfo.vessel">Vessel*</Label>
                  <Input id="blInfo.vessel" placeholder="e.g. MSC ANNA" {...register('blInfo.vessel')} />
                  {errors.blInfo?.vessel && <p className="text-red-500 text-xs mt-1">{errors.blInfo.vessel.message}</p>}
                </div>
                <div>
                  <Label htmlFor="blInfo.voyageNo">Voyage#*</Label>
                  <Input id="blInfo.voyageNo" placeholder="e.g. KMX412" {...register('blInfo.voyageNo')} />
                  {errors.blInfo?.voyageNo && <p className="text-red-500 text-xs mt-1">{errors.blInfo.voyageNo.message}</p>}
                </div>
                <div>
                  <Label htmlFor="blInfo.sailingDate">Sailing Date</Label>
                  <Controller name="blInfo.sailingDate" control={control} render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value && isValid(parseISO(field.value)) ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus />
                      </PopoverContent>
                    </Popover>
                  )} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bl-detail" className="p-6 border-t space-y-8">
              <h1 className="text-2xl font-bold text-foreground">Setting info</h1>

              {/* Offer Info section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary border-b pb-2">Offer Info</h2>
                <div className="p-4 border rounded-md space-y-4">
                  <div>
                    <h3 className="font-medium">Import</h3>
                    <Controller name="blDetail.compliance.importType" control={control} render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Personal" id="import-personal" /><Label htmlFor="import-personal" className="font-normal">Personal</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Server" id="import-server" /><Label htmlFor="import-server" className="font-normal">Server</Label></div>
                      </RadioGroup>
                    )} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="blDetail.compliance.clientCount">Client list:</Label>
                    <Input
                      id="blDetail.compliance.clientCount"
                      type="number"
                      className="w-24"
                      {...register('blDetail.compliance.clientCount', {
                        setValueAs: (v) => (v === '' || v === null ? undefined : parseInt(v, 10)),
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="blDetail.compliance.customsValue">Customs Value</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="blDetail.compliance.customsValue"
                        type="number"
                        className="pl-8"
                        placeholder="0.00"
                        {...register('blDetail.compliance.customsValue', {
                          setValueAs: (v) => (v === '' || v === null ? undefined : parseFloat(v)),
                        })}
                      />
                    </div>
                     {errors.blDetail?.compliance?.customsValue && <p className="text-red-500 text-xs mt-1">{errors.blDetail.compliance.customsValue.message}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller name="blDetail.compliance.hasMetClass" control={control} render={({ field }) => (
                      <Checkbox id="hasMetClass" checked={field.value} onCheckedChange={field.onChange} />
                    )} />
                    <Label htmlFor="hasMetClass" className="font-normal">Has met Class*</Label>
                  </div>
                  {errors.blDetail?.compliance?.hasMetClass && <p className="text-red-500 text-xs mt-1">{errors.blDetail.compliance.hasMetClass.message}</p>}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="container-info" className="p-6 border-t text-center text-muted-foreground">Placeholder for Container Info.</TabsContent>
            <TabsContent value="ref-stamp" className="p-6 border-t text-center text-muted-foreground">Placeholder for Ref No's/Stamp.</TabsContent>
            <TabsContent value="tracing-notes" className="p-6 border-t text-center text-muted-foreground">Placeholder for Tracing Notes.</TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end p-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading} className="mr-2">Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditMode ? 'Save Changes' : 'Create B/L'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
