
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, ShieldPlus, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function LandedCostCalculationSection() {
  const { toast } = useToast();
  const [includeInsurance, setIncludeInsurance] = useState(false);

  const handleMockAction = (actionName: string) => {
    toast({
      title: "Action Triggered (Mock)",
      description: `${actionName} functionality is not yet implemented.`,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center">
          <Calculator className="h-6 w-6 mr-2 text-primary" />
          <CardTitle className="text-xl font-semibold text-foreground font-headline">Landed Cost Calculation</CardTitle>
        </div>
        <CardDescription>Estimate total landed costs including duties, taxes, and insurance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Duty/Tax Estimation</Label>
          <div className="grid grid-cols-2 gap-4 mt-1">
            <Input placeholder="Goods Value (USD)" type="number" />
            <Input placeholder="Origin Country" />
            <Input placeholder="Destination Country" />
            <Input placeholder="HS Code" />
          </div>
          <Button variant="outline" className="mt-2 w-full" onClick={() => handleMockAction('Duty/Tax Estimation')}>
            <Percent className="mr-2 h-4 w-4" /> Estimate Duty/Tax
          </Button>
        </div>
        
        <div>
          <Label className="text-sm font-medium">Freight Insurance Integration</Label>
          <div className="space-y-2 mt-1">
            <div className="flex items-center space-x-2">
              <Checkbox id="includeInsurance" checked={includeInsurance} onCheckedChange={(checked) => setIncludeInsurance(checked as boolean)} />
              <Label htmlFor="includeInsurance" className="text-sm font-normal">Include Freight Insurance</Label>
            </div>
            {includeInsurance && (
              <Input placeholder="Insured Value (USD)" type="number" />
            )}
            <Button variant="outline" className="w-full" onClick={() => handleMockAction('Freight Insurance Quote')} disabled={!includeInsurance}>
              <ShieldPlus className="mr-2 h-4 w-4" /> Get Insurance Quote
            </Button>
            <p className="text-xs text-muted-foreground mt-1">Note: Requires integration with insurance providers.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Calculations are estimates. Actual costs may vary.</p>
      </CardFooter>
    </Card>
  );
}
