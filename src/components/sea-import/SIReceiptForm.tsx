// src/components/sea-import/SIReceiptForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siReceiptSchema, type SIReceipt } from '@/lib/schemas/siReceiptSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SIReceiptFormProps {
  initialData: SIReceipt | null;
  onSubmit: (data: SIReceipt) => void;
  onCancel: () => void;
}

// Mock data, should come from a central store or API
const mockCustomers = [
    { name: 'MERCITEX PRIVATE LIMITED' },
    { name: 'ALPHA TRADING CO.' },
    { name: 'GLOBAL IMPEX SOLUTIONS' },
];
const mockSIJobs = [
    { id: 'SIJ-25-0001', invoiceId: 'INV-SI-001', customerName: 'ALPHA TRADING CO.' },
    { id: 'SIJ-25-0002', invoiceId: 'INV-SI-002', customerName: 'GLOBAL IMPEX SOLUTIONS' },
];

export function SIReceiptForm({ initialData, onSubmit, onCancel }: SIReceiptFormProps) {
  const { toast } = useToast();
  const defaultValues: SIReceipt = {
    teamDate: '',
    accountInfo: {
      mode: '',
      subType: '',
      bankAccountNo: '',
      chequeNo: '',
      chequeDate: '',
    },
    customerInfo: {
      customerName: '',
      currency: 'PKR',
      isMultiCurrency: false,
      isTotalAmount: false,
    },
    settlement: { isOpenDispute: false },
    linking: {},
    manualRemarks: {},
    summary: {
        totalAmount: 0,
        adverse: 0,
        bf: 0,
        notReceived: 0,
        freightCharges: 0,
        security: 0,
        detention: 0,
        bankAmount: 0,
    },
    remarks: '',
  };

  const form = useForm<SIReceipt>({
    resolver: zodResolver(siReceiptSchema),
    defaultValues: initialData || defaultValues,
  });

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = form;

  const selectedJobNo = watch('linking.jobNo');
  useEffect(() => {
    if (selectedJobNo) {
      const job = mockSIJobs.find(j => j.id === selectedJobNo);
      if (job) {
        setValue('linking.invoiceNo', job.invoiceId);
        if(watch('customerInfo.customerName') !== job.customerName) {
            setValue('customerInfo.customerName', job.customerName);
            toast({ title: "Customer Updated", description: "Customer auto-selected based on Job #."});
        }
      }
    } else {
        setValue('linking.invoiceNo', '');
    }
  }, [selectedJobNo, setValue, watch, toast]);

  const watchedSummary = watch('summary');
  useEffect(() => {
    if (watchedSummary) {
      const { adverse, bf, notReceived, freightCharges, security, detention, bankAmount } = watchedSummary;
      const total = (adverse || 0) + (bf || 0) + (notReceived || 0) + (freightCharges || 0) + (security || 0) + (detention || 0) + (bankAmount || 0);
      if (watch('summary.totalAmount') !== total) {
        setValue('summary.totalAmount', total);
      }
    }
  }, [watchedSummary, setValue, watch]);

  const onFormSubmit = (data: SIReceipt) => {
    onSubmit(data);
  };
  
  const onFormError = (err: any) => {
      console.log("Form Errors:", err);
      toast({title: "Validation Error", description: "Please fill all required (*) fields.", variant: "destructive"});
  }

  const renderDatePicker = (fieldName: any, label: string) => (
    <div>
        <Label htmlFor={fieldName}>{label}*</Label>
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
        {errors[fieldName.split('.')[0] as keyof SIReceipt]?.[fieldName.split('.')[1] as any] && <p className="text-destructive text-xs mt-1">{(errors[fieldName.split('.')[0] as keyof SIReceipt]?.[fieldName.split('.')[1] as any] as any).message}</p>}
    </div>
  );
  
  const Section = ({ title, children, className }: {title: string, children: React.ReactNode, className?: string}) => (
      <div className={cn("p-4 border rounded-md space-y-4", className)}>
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          {children}
      </div>
  );
  
  const formatCurrencyForDisplay = (amount?: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
        {/* Top Header */}
        <div className="flex justify-between items-start p-4 border rounded-md">
            <h2 className="text-2xl font-bold">Add SI Receipt</h2>
            <div className="w-48">
                <Label htmlFor="teamDate">Team Date*</Label>
                <Controller name="teamDate" control={control} render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild><Button variant="outline" className="w-full"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(parseISO(field.value), "PPP") : "Select date"}</Button></PopoverTrigger>
                        <PopoverContent><Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(d) => field.onChange(d?.toISOString())} /></PopoverContent>
                    </Popover>
                )} />
                {errors.teamDate && <p className="text-destructive text-xs">{errors.teamDate.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
                <Section title="Account Info">
                    <div className="grid grid-cols-2 gap-4">
                         <div><Label>Mode*</Label><Controller name="accountInfo.mode" control={control} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent><SelectItem value="Bank">Bank</SelectItem><SelectItem value="Cash">Cash</SelectItem></SelectContent></Select>}/>{errors.accountInfo?.mode && <p className="text-destructive text-xs">{errors.accountInfo.mode.message}</p>}</div>
                        <div><Label>Sub Type*</Label><Controller name="accountInfo.subType" control={control} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent><SelectItem value="Cheque">Cheque</SelectItem><SelectItem value="Transfer">Transfer</SelectItem></SelectContent></Select>}/>{errors.accountInfo?.subType && <p className="text-destructive text-xs">{errors.accountInfo.subType.message}</p>}</div>
                        <div><Label>Bank Account #*</Label><Input {...register("accountInfo.bankAccountNo")} />{errors.accountInfo?.bankAccountNo && <p className="text-destructive text-xs">{errors.accountInfo.bankAccountNo.message}</p>}</div>
                        <div><Label>Cheque #*</Label><Input {...register("accountInfo.chequeNo")} />{errors.accountInfo?.chequeNo && <p className="text-destructive text-xs">{errors.accountInfo.chequeNo.message}</p>}</div>
                        <div className="col-span-2">{renderDatePicker("accountInfo.chequeDate", "Date")}</div>
                    </div>
                </Section>
                <Section title="Customer">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><Label>Customer*</Label><Controller name="customerInfo.customerName" control={control} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select Customer..."/></SelectTrigger><SelectContent>{mockCustomers.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>}/>{errors.customerInfo?.customerName && <p className="text-destructive text-xs">{errors.customerInfo.customerName.message}</p>}</div>
                        <div><Label>Currency</Label><Input value="PKR" readOnly className="bg-muted"/></div>
                        <div><Label>Customer Rate</Label><Input type="number" {...register("customerInfo.customerRate", {setValueAs: v => v ? parseFloat(v) : undefined})}/></div>
                        <div className="col-span-2 space-y-2">
                           <div className="flex items-center space-x-2"><Controller name="customerInfo.isMultiCurrency" control={control} render={({field}) => <Checkbox id="isMultiCurrency" checked={field.value} onCheckedChange={field.onChange}/>}/><Label htmlFor="isMultiCurrency" className="font-normal">Multi Currency</Label></div>
                           <div className="flex items-center space-x-2"><Controller name="customerInfo.isTotalAmount" control={control} render={({field}) => <Checkbox id="isTotalAmount" checked={field.value} onCheckedChange={field.onChange}/>}/><Label htmlFor="isTotalAmount" className="font-normal">Total Amount</Label></div>
                        </div>
                    </div>
                </Section>
                 <Section title="Settlement">
                     <div className="grid grid-cols-2 gap-4 items-center">
                        <div><Label>Security</Label><Controller name="settlement.security" control={control} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent><SelectItem value="Adjustment">Adjustment</SelectItem><SelectItem value="Open Dispute">Open Dispute</SelectItem></SelectContent></Select>}/></div>
                        <div className="flex items-center space-x-2 pt-6"><Controller name="settlement.isOpenDispute" control={control} render={({field}) => <Checkbox id="isOpenDispute" checked={field.value} onCheckedChange={field.onChange}/>}/><Label htmlFor="isOpenDispute" className="font-normal">Open Dispute</Label></div>
                     </div>
                 </Section>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
                 <Section title="Job & Invoice Linking" className="h-full">
                     <div className="grid grid-cols-3 gap-x-2 gap-y-4 text-sm">
                        <div><Label>Job #</Label><Controller name="linking.jobNo" control={control} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select Job..."/></SelectTrigger><SelectContent>{mockSIJobs.map(j => <SelectItem key={j.id} value={j.id}>{j.id}</SelectItem>)}</SelectContent></Select>}/></div>
                        <div><Label>Invoice #</Label><Input {...register("linking.invoiceNo")} readOnly className="bg-muted"/></div>
                        <div><Label>Invoice Date</Label><Controller name="linking.invoiceDate" control={control} render={({field}) => <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full h-9"><CalendarIcon className="h-4 w-4"/></Button></PopoverTrigger><PopoverContent><Calendar mode="single" onSelect={(d) => field.onChange(d?.toISOString())}/></PopoverContent></Popover>}/></div>
                        <div><Label>Bet #</Label><Input {...register("linking.betNo")}/></div>
                        <div><Label>Hilt #</Label><Input {...register("linking.hiltNo")}/></div>
                        <div><Label>Milt #</Label><Input {...register("linking.miltNo")}/></div>
                        <div><Label>Inv Currency</Label><Input {...register("linking.invCurrency")}/></div>
                        <div><Label>Inv Rate</Label><Input type="number" {...register("linking.invRate", {setValueAs: v => v ? parseFloat(v) : undefined})}/></div>
                        <div><Label>Amount</Label><Input type="number" {...register("linking.amount", {setValueAs: v => v ? parseFloat(v) : undefined})}/></div>
                        <div><Label>Balance</Label><Input type="number" {...register("linking.balance", {setValueAs: v => v ? parseFloat(v) : undefined})}/></div>
                        <div><Label>File No</Label><Input {...register("linking.fileNo")}/></div>
                        <div><Label>Controller #</Label><Input {...register("linking.controllerNo")}/></div>
                        <div><Label>Index</Label><Input {...register("linking.index")}/></div>
                     </div>
                 </Section>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Manual Remarks">
                <div className="grid grid-cols-4 gap-2 text-sm">
                    <Label className="col-span-1">Home</Label><Input className="col-span-3 h-8" {...register("manualRemarks.home")}/>
                    <Label className="col-span-1">Hilt</Label><Input className="col-span-3 h-8" {...register("manualRemarks.hilt")}/>
                    <Label className="col-span-1">Milt</Label><Input className="col-span-3 h-8" {...register("manualRemarks.milt")}/>
                    <Label className="col-span-1">Job #</Label><Input className="col-span-3 h-8" {...register("manualRemarks.jobNo")}/>
                    <Label className="col-span-1">File #</Label><Input className="col-span-3 h-8" {...register("manualRemarks.fileNo")}/>
                    <Label className="col-span-1">Reference #</Label><Input className="col-span-3 h-8" {...register("manualRemarks.referenceNo")}/>
                    <Label className="col-span-1">Vehicle #</Label><Input className="col-span-3 h-8" {...register("manualRemarks.vehicleNo")}/>
                </div>
            </Section>
            <div className="space-y-4">
                <Section title="Financial Summary">
                    <div className="flex justify-between items-center">
                        <Label className="font-bold text-lg">Total Amount:</Label>
                        <Input readOnly value={formatCurrencyForDisplay(watch('summary.totalAmount'))} className="w-32 text-right font-bold text-lg bg-muted"/>
                    </div>
                     <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm items-center">
                        <Label htmlFor="summary.adverse">Adverse</Label>
                        <Input id="summary.adverse" type="number" className="h-8" {...register("summary.adverse", { setValueAs: v => v ? parseFloat(v) : undefined })} />
                        <Label htmlFor="summary.bf">BF</Label>
                        <Input id="summary.bf" type="number" className="h-8" {...register("summary.bf", { setValueAs: v => v ? parseFloat(v) : undefined })} />
                        <Label htmlFor="summary.notReceived">Not Received</Label>
                        <Input id="summary.notReceived" type="number" className="h-8" {...register("summary.notReceived", { setValueAs: v => v ? parseFloat(v) : undefined })} />
                     </div>
                </Section>
                <div className="p-4 border rounded-md">
                    <Textarea placeholder="Remarks..." {...register("remarks")} />
                     <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm mt-2 items-center">
                        <Label htmlFor="summary.freightCharges">Freight / Other Charges</Label>
                        <Input id="summary.freightCharges" type="number" className="h-8" {...register("summary.freightCharges", { setValueAs: v => v ? parseFloat(v) : undefined })} />
                        <Label htmlFor="summary.security">Security</Label>
                        <Input id="summary.security" type="number" className="h-8" {...register("summary.security", { setValueAs: v => v ? parseFloat(v) : undefined })} />
                        <Label htmlFor="summary.detention">Detention</Label>
                        <Input id="summary.detention" type="number" className="h-8" {...register("summary.detention", { setValueAs: v => v ? parseFloat(v) : undefined })} />
                        <Label htmlFor="summary.bankAmount">Bank Amount</Label>
                        <Input id="summary.bankAmount" type="number" className="h-8" {...register("summary.bankAmount", { setValueAs: v => v ? parseFloat(v) : undefined })} />
                    </div>
                </div>
            </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save</Button>
        </div>
    </form>
  );
}
