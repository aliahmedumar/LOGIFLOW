// src/components/air-import/AIJobForm.tsx
'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aiJobSchema, type AIJob } from '@/lib/schemas/aiJobSchema';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type AIJobFormProps = {
  action: 'new' | 'edit' | 'view';
  initialData?: AIJob | null;
};

export function AIJobForm({ action, initialData }: AIJobFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isViewMode = action === 'view';

  const { register, handleSubmit, control, formState: { errors } } = useForm<AIJob>({
    resolver: zodResolver(aiJobSchema),
    defaultValues: initialData || {
      jobDate: format(new Date(), 'yyyy-MM-dd'),
      jobType: 'Direct',
      dgNonDg: 'NonDG',
      status: 'Opened',
      poDetails: [],
      itemDetails: [],
      dimensions: [],
    },
  });
  
  const { fields: poFields, append: appendPo, remove: removePo } = useFieldArray({ control, name: "poDetails" });
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({ control, name: "itemDetails" });
  const { fields: dimFields, append: appendDim, remove: removeDim } = useFieldArray({ control, name: "dimensions" });


  const onSubmit = (data: AIJob) => {
    setIsLoading(true);

    try {
      const storedJobs = localStorage.getItem('ai_jobs_mock');
      let jobs: AIJob[] = storedJobs ? JSON.parse(storedJobs) : [];

      if (action === 'new') {
        const newJob = { ...data, id: `ai-job-${Date.now()}` };
        jobs.push(newJob);
      } else {
        jobs = jobs.map(job => (job.id === initialData?.id ? { ...job, ...data } : job));
      }
      
      localStorage.setItem('ai_jobs_mock', JSON.stringify(jobs));

      toast({
        title: `AI Job ${action === 'new' ? 'Created' : 'Updated'}`,
        description: "Successfully saved the job details.",
      });

      // Redirect back to the list page after a short delay
      setTimeout(() => {
        router.push('/dashboard/air-import/ai-job');
        router.refresh(); // Forces a refresh to show the updated list
      }, 500);

    } catch (error) {
      console.error("Failed to save job:", error);
      toast({
        title: "Error",
        description: "Could not save the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Collapsible defaultOpen>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {action === 'new' ? 'Create AI Job' : action === 'edit' ? 'Edit AI Job' : 'View AI Job'}
        </h2>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          {!isViewMode && <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save and Exit'}</Button>}
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-9 space-y-6">
          <SectionCard title="Basic Info">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer *</Label>
                <Input id="customer" {...register('customer')} disabled={isViewMode} />
                {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer.message}</p>}
              </div>
              <div>
                <Label htmlFor="customerRef">Customer Ref</Label>
                <Input id="customerRef" {...register('customerRef')} disabled={isViewMode} />
              </div>
              <div>
                <Label htmlFor="salesRep">Sales Rep *</Label>
                <Input id="salesRep" {...register('salesRep')} disabled={isViewMode} />
                {errors.salesRep && <p className="text-red-500 text-xs mt-1">{errors.salesRep.message}</p>}
              </div>
               <div>
                <Label htmlFor="quotation">Quotation</Label>
                <Input id="quotation" {...register('quotation')} disabled={isViewMode} />
              </div>
            </div>
          </SectionCard>

          {/* Origin & Destination */}
          <div className="grid grid-cols-2 gap-6">
            <SectionCard title="Origin">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="placeOfReceipt">Place of Receipt</Label>
                  <Input id="placeOfReceipt" {...register('placeOfReceipt')} disabled={isViewMode} />
                </div>
                <div>
                  <Label htmlFor="airportOfLoading">Airport of Loading *</Label>
                  <Input id="airportOfLoading" {...register('airportOfLoading')} disabled={isViewMode} />
                   {errors.airportOfLoading && <p className="text-red-500 text-xs mt-1">{errors.airportOfLoading.message}</p>}
                </div>
                <div>
                  <Label htmlFor="airportOfTranshipment">Airport of Transhipment</Label>
                  <Input id="airportOfTranshipment" {...register('airportOfTranshipment')} disabled={isViewMode} />
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Destination">
              <div className="space-y-4">
                 <div>
                  <Label htmlFor="airportOfDischarge">Airport of Discharge *</Label>
                  <Input id="airportOfDischarge" {...register('airportOfDischarge')} disabled={isViewMode} />
                  {errors.airportOfDischarge && <p className="text-red-500 text-xs mt-1">{errors.airportOfDischarge.message}</p>}
                </div>
                <div>
                  <Label htmlFor="finalDestination">Final Destination</Label>
                  <Input id="finalDestination" {...register('finalDestination')} disabled={isViewMode} />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Cargo Details */}
          <SectionCard title="Cargo Details">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="commodity">Commodity *</Label>
                <Input id="commodity" {...register('commodity')} disabled={isViewMode} />
                {errors.commodity && <p className="text-red-500 text-xs mt-1">{errors.commodity.message}</p>}
              </div>
              <div>
                <Label htmlFor="incoTerms">Inco Terms</Label>
                <Input id="incoTerms" {...register('incoTerms')} disabled={isViewMode} />
              </div>
              <div>
                <Label htmlFor="grossWeight">Gross Weight *</Label>
                <Input id="grossWeight" type="number" {...register('grossWeight', { valueAsNumber: true })} disabled={isViewMode} />
                {errors.grossWeight && <p className="text-red-500 text-xs mt-1">{errors.grossWeight.message}</p>}
              </div>
              <div>
                <Label htmlFor="chargeableWeight">Chargeable Weight *</Label>
                <Input id="chargeableWeight" type="number" {...register('chargeableWeight', { valueAsNumber: true })} disabled={isViewMode} />
                {errors.chargeableWeight && <p className="text-red-500 text-xs mt-1">{errors.chargeableWeight.message}</p>}
              </div>
            </div>
          </SectionCard>
           {/* More sections can be added here */}
          
          <SectionCard title="Transport">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Air Line *</Label>
                  <Input {...register('airLine')} disabled={isViewMode} />
                  {errors.airLine && <p className="text-red-500 text-xs mt-1">{errors.airLine.message}</p>}
                </div>
                <div>
                  <Label>Flight # *</Label>
                  <Input {...register('flightNo')} disabled={isViewMode} />
                   {errors.flightNo && <p className="text-red-500 text-xs mt-1">{errors.flightNo.message}</p>}
                </div>
             </div>
          </SectionCard>

           <SectionCard title="PO Detail">
            <div>
              <div className="grid grid-cols-6 gap-2 p-2 bg-gray-100 rounded-t-md font-semibold">
                <div>PO/Reference #</div>
                <div>Style</div>
                <div>Packages</div>
                <div>Pack Code</div>
                <div>Status</div>
                <div>Action</div>
              </div>
              {poFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-6 gap-2 p-2 border-b">
                  <Input {...register(`poDetails.${index}.poReference`)} disabled={isViewMode} />
                  <Input {...register(`poDetails.${index}.style`)} disabled={isViewMode} />
                  <Input {...register(`poDetails.${index}.packages`)} disabled={isViewMode} />
                  <Input {...register(`poDetails.${index}.packCode`)} disabled={isViewMode} />
                  <Input {...register(`poDetails.${index}.status`)} disabled={isViewMode} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePo(index)} disabled={isViewMode}>
                    <Trash2 className="h-4 w-4 text-red-500"/>
                  </Button>
                </div>
              ))}
              {!isViewMode && (
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendPo({})}>
                  <PlusCircle className="h-4 w-4 mr-2"/> Add PO Detail
                </Button>
              )}
            </div>
          </SectionCard>

          <SectionCard title="AWB Information">
             <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>HAWB # *</Label>
                  <Input {...register('hawb')} disabled={isViewMode} />
                  {errors.hawb && <p className="text-red-500 text-xs mt-1">{errors.hawb.message}</p>}
                </div>
                <div>
                  <Label>HAWB Date</Label>
                  <Input type="date" {...register('hawbDate')} disabled={isViewMode} />
                </div>
                <div>
                  <Label>MAWB #</Label>
                  <Input {...register('mawb')} disabled={isViewMode} />
                </div>
                <div>
                  <Label>MAWB Date</Label>
                  <Input type="date" {...register('mawbDate')} disabled={isViewMode} />
                </div>
             </div>
          </SectionCard>

          <SectionCard title="Item Detail">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">No of Pcs</th>
                    <th className="p-2 text-left">Gross WT</th>
                    <th className="p-2 text-left">Chargeable WT</th>
                    {/* Add all other headers */}
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {itemFields.map((field, index) => (
                    <tr key={field.id} className="border-b">
                      <td><Input type="number" {...register(`itemDetails.${index}.noOfPcs`, { valueAsNumber: true })} disabled={isViewMode} /></td>
                      <td><Input type="number" {...register(`itemDetails.${index}.grossWt`, { valueAsNumber: true })} disabled={isViewMode} /></td>
                      <td><Input type="number" {...register(`itemDetails.${index}.chargeableWt`, { valueAsNumber: true })} disabled={isViewMode} /></td>
                      {/* Add all other inputs */}
                      <td>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={isViewMode}>
                          <Trash2 className="h-4 w-4 text-red-500"/>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!isViewMode && (
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendItem({})}>
                  <PlusCircle className="h-4 w-4 mr-2"/> Add Item
                </Button>
              )}
            </div>
            
            <div className="mt-4">
              <Label className="font-semibold">Dimensions</Label>
              {dimFields.map((field, index) => (
                 <div key={field.id} className="grid grid-cols-7 gap-2 p-2 border-b">
                    <Input placeholder="Length" type="number" {...register(`dimensions.${index}.length`, { valueAsNumber: true })} />
                    <Input placeholder="Width" type="number" {...register(`dimensions.${index}.width`, { valueAsNumber: true })} />
                    <Input placeholder="Height" type="number" {...register(`dimensions.${index}.height`, { valueAsNumber: true })} />
                    <Input placeholder="Qty" type="number" {...register(`dimensions.${index}.qty`, { valueAsNumber: true })} />
                    <Input placeholder="Volume" disabled />
                    <Input placeholder="Weight" disabled />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDim(index)} disabled={isViewMode}>
                        <Trash2 className="h-4 w-4 text-red-500"/>
                    </Button>
                 </div>
              ))}
               {!isViewMode && (
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendDim({})}>
                  <PlusCircle className="h-4 w-4 mr-2"/> Add Dimension
                </Button>
              )}
            </div>
          </SectionCard>

        </div>
        <div className="col-span-3">
          <Card>
            <CardHeader><CardTitle>Job Properties</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <Label htmlFor="jobDate">Job Date</Label>
                  <Input id="jobDate" type="date" {...register('jobDate')} disabled={isViewMode} />
                  {errors.jobDate && <p className="text-red-500 text-xs mt-1">{errors.jobDate.message}</p>}
              </div>
               {/* ... other job properties */}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
} 