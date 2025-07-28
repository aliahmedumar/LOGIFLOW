// src/components/sea-import/SIInvoiceForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siInvoiceSchema, type SIInvoice, type ChargeItem } from '@/lib/schemas/siInvoiceSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO, addDays } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SIInvoiceFormProps {
  initialData: SIInvoice | null;
  onSubmit: (data: SIInvoice) => void;
  onCancel: () => void;
}

// Mock data, should come from a central store or API
const mockSIJobs = [
    { id: 'SIJ-25-0001', hbl: 'HBLSINXYZ123', mbl: 'MBLSINXYZ456', costCenter: 'HEAD OFFICE', customerName: 'ALPHA TRADING CO.' },
    { id: 'SIJ-25-0002', hbl: 'HBLHKGABC789', mbl: 'MBLHKGABC012', costCenter: 'BRANCH A', customerName: 'GLOBAL IMPEX SOLUTIONS' },
];
const mockCustomers = [
    { name: 'MERCITEX PRIVATE LIMITED', bankDetail: 'Bank Al-Habib, Main Branch, Account # 123456789' },
    { name: 'ALPHA TRADING CO.', bankDetail: 'Meezan Bank, Corporate Branch, Account # 987654321' },
    { name: 'GLOBAL IMPEX SOLUTIONS', bankDetail: 'Standard Chartered, I.I. Chundrigar, Account # 1122334455' },
];
const mockCostCenters = ['HEAD OFFICE', 'BRANCH A', 'WAREHOUSE OPS'];
const mockChargeDescriptions = ['Ocean Freight', 'Terminal Handling Charges', 'Documentation Fee', 'BL Fee', 'Customs Clearance'];

export function SIInvoiceForm({ initialData, onSubmit, onCancel }: SIInvoiceFormProps) {
  const defaultValues: SIInvoice = {
    invoiceDate: new Date().toISOString(),
    invoiceType: 'Standard',
    status: 'Draft',
    customerName: '',
    jobId: '',
    invoiceTitle: '',
    costCenter: '',
    charges: [{ description: '', rate: 0, qty: 1, amount: 0, taxable: false }],
    currency: 'PKR',
    dueDays: 30,
    wthTds: {},
    discount: 0,
    settledAmount: 0,
    // Calculated fields
    totalAmount: 0,
    netAmount: 0,
    taxAmount: 0,
    grossTotal: 0,
    balance: 0,
  };

  const form = useForm<SIInvoice>({
    resolver: zodResolver(siInvoiceSchema),
    defaultValues: initialData || defaultValues,
  });
  
  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "charges",
  });

  // Watch for changes to auto-calculate totals
  const watchedCharges = watch('charges');
  const watchedDiscount = watch('discount');
  const watchedSettledAmount = watch('settledAmount');

  useEffect(() => {
    const total = watchedCharges.reduce((acc, charge) => acc + (charge.qty * charge.rate), 0);
    const tax = watchedCharges.filter(c => c.taxable).reduce((acc, charge) => acc + (charge.qty * charge.rate * 0.16), 0); // Assuming 16% tax
    const net = total - (watchedDiscount || 0);
    const gross = net + tax;
    const bal = gross - (watchedSettledAmount || 0);

    setValue('totalAmount', total);
    setValue('taxAmount', tax);
    setValue('netAmount', net);
    setValue('grossTotal', gross);
    setValue('balance', bal);
  }, [watchedCharges, watchedDiscount, watchedSettledAmount, setValue]);
  
  const selectedJobId = watch('jobId');
  useEffect(() => {
    if(selectedJobId) {
      const job = mockSIJobs.find(j => j.id === selectedJobId);
      if(job) {
        setValue('customerName', job.customerName);
        setValue('costCenter', job.costCenter);
        setValue('jobInfo.hbl', job.hbl);
        setValue('jobInfo.mbl', job.mbl);
      }
    }
  }, [selectedJobId, setValue]);

  const onFormSubmit = (data: SIInvoice) => {
    onSubmit(data);
  };
  
  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-US').format(amount || 0);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg">
        <div>
            <Label htmlFor="invoiceDate">Invoice Date*</Label>
             <Controller name="invoiceDate" control={control} render={({ field }) => (
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
            {errors.invoiceDate && <p className="text-destructive text-xs mt-1">{errors.invoiceDate.message}</p>}
        </div>
         <div>
            <Label>Due Date</Label>
            <Input readOnly value={format(addDays(parseISO(watch('invoiceDate')), watch('dueDays')), 'PPP')} className="bg-muted" />
        </div>
        <div>
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" {...register('reference')} />
        </div>
        <div>
            <Label htmlFor="status">Status</Label>
            <Input readOnly value={watch('status')} className="bg-muted font-semibold"/>
        </div>
      </div>
      
      {/* Customer Section */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
        <div>
            <Label htmlFor="customerName">Customer*</Label>
            <Controller name="customerName" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select Customer"/></SelectTrigger>
                <SelectContent>{mockCustomers.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>
            )} />
            {errors.customerName && <p className="text-destructive text-xs mt-1">{errors.customerName.message}</p>}
        </div>
         <div>
            <Label htmlFor="dueDays">Due Days</Label>
            <Input id="dueDays" type="number" {...register('dueDays', { setValueAs: v => parseInt(v) })}/>
        </div>
        <div>
            <Label htmlFor="bankDetail">Bank Detail</Label>
            <Input id="bankDetail" {...register('bankDetail')} />
        </div>
      </div>
      
      {/* Details Section */}
       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border rounded-lg">
        <div><Label htmlFor="invoiceType">Invoice Type</Label><Controller name="invoiceType" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['Standard', 'Credit Note', 'Debit Note'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>)} /></div>
        <div><Label htmlFor="jobId">Job #*</Label><Controller name="jobId" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select Job"/></SelectTrigger><SelectContent>{mockSIJobs.map(j => <SelectItem key={j.id} value={j.id}>{j.id}</SelectItem>)}</SelectContent></Select>)} />{errors.jobId && <p className="text-destructive text-xs mt-1">{errors.jobId.message}</p>}</div>
        <div className="lg:col-span-2"><Label htmlFor="invoiceTitle">Invoice Title*</Label><Input id="invoiceTitle" {...register('invoiceTitle')} />{errors.invoiceTitle && <p className="text-destructive text-xs mt-1">{errors.invoiceTitle.message}</p>}</div>
        <div><Label htmlFor="costCenter">Cost Center*</Label><Controller name="costCenter" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mockCostCenters.map(cc => <SelectItem key={cc} value={cc}>{cc}</SelectItem>)}</SelectContent></Select>)} />{errors.costCenter && <p className="text-destructive text-xs mt-1">{errors.costCenter.message}</p>}</div>
      </div>

      {/* Charges Table */}
      <div>
        <Table>
            <TableHeader><TableRow><TableHead>Charge Description*</TableHead><TableHead>Size Type</TableHead><TableHead>Rate*</TableHead><TableHead>Qty*</TableHead><TableHead>Amount</TableHead><TableHead>Tax</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
            {fields.map((field, index) => (
                <TableRow key={field.id}>
                    <TableCell><Controller name={`charges.${index}.description`} control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mockChargeDescriptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>)} /></TableCell>
                    <TableCell><Input {...register(`charges.${index}.sizeType`)} /></TableCell>
                    <TableCell><Input type="number" {...register(`charges.${index}.rate`, { setValueAs: v => parseFloat(v) })} onChange={(e) => setValue(`charges.${index}.amount`, parseFloat(e.target.value) * watch(`charges.${index}.qty`))} /></TableCell>
                    <TableCell><Input type="number" {...register(`charges.${index}.qty`, { setValueAs: v => parseInt(v) })} onChange={(e) => setValue(`charges.${index}.amount`, parseFloat(e.target.value) * watch(`charges.${index}.rate`))} /></TableCell>
                    <TableCell><Input readOnly {...register(`charges.${index}.amount`)} className="bg-muted"/></TableCell>
                    <TableCell className="text-center"><Controller name={`charges.${index}.taxable`} control={control} render={({ field }) => (<Checkbox checked={field.value} onCheckedChange={field.onChange}/>)} /></TableCell>
                    <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        <Button type="button" size="sm" variant="outline" onClick={() => append({ description: '', rate: 0, qty: 1, amount: 0, taxable: false })} className="mt-2"><PlusCircle className="mr-2 h-4 w-4"/>Add Charge</Button>
        {errors.charges && <p className="text-destructive text-xs mt-1">{errors.charges.message}</p>}
      </div>
      
      {/* Totals and Remarks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2 p-4 border rounded-lg">
             <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" {...register('remarks')} rows={5}/>
             <div className="grid grid-cols-2 gap-4">
                {/* WTH/TDS Section */}
                <Label className="col-span-2 font-bold">WTH / TDS</Label>
                <div className="flex items-center space-x-2"><Controller name="wthTds.incomeTax.enabled" control={control} render={({field})=><Checkbox checked={field.value} onCheckedChange={field.onChange}/>}/><Label>Income Tax</Label></div>
                <div className="flex items-center space-x-2"><Controller name="wthTds.salesTax.enabled" control={control} render={({field})=><Checkbox checked={field.value} onCheckedChange={field.onChange}/>}/><Label>Sales Tax</Label></div>
                <div className="flex items-center space-x-2"><Controller name="wthTds.furtherTax.enabled" control={control} render={({field})=><Checkbox checked={field.value} onCheckedChange={field.onChange}/>}/><Label>Further Tax</Label></div>
                <div className="flex items-center space-x-2"><Controller name="wthTds.fed.enabled" control={control} render={({field})=><Checkbox checked={field.value} onCheckedChange={field.onChange}/>}/><Label>FED</Label></div>
             </div>
        </div>
        <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <div className="flex justify-between items-center"><Label>Total Amount</Label><p className="font-mono">{formatCurrency(watch('totalAmount'))}</p></div>
            <div className="flex justify-between items-center"><Label htmlFor="discount">Discount</Label><Input type="number" id="discount" className="w-24 h-8" {...register('discount', {setValueAs: v => parseFloat(v)})} /></div>
            <div className="flex justify-between items-center"><Label>Net Amount</Label><p className="font-mono">{formatCurrency(watch('netAmount'))}</p></div>
            <div className="flex justify-between items-center"><Label>Tax</Label><p className="font-mono">{formatCurrency(watch('taxAmount'))}</p></div>
            <hr />
            <div className="flex justify-between items-center font-bold text-lg"><Label>Gross Total</Label><p className="font-mono">{formatCurrency(watch('grossTotal'))}</p></div>
            <div className="flex justify-between items-center"><Label htmlFor="settledAmount">Settled</Label><Input type="number" id="settledAmount" className="w-24 h-8" {...register('settledAmount', {setValueAs: v => parseFloat(v)})} /></div>
            <hr />
            <div className="flex justify-between items-center font-bold text-lg"><Label>Balance</Label><p className="font-mono">{formatCurrency(watch('balance'))}</p></div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
