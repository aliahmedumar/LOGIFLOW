
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Warehouse, ScanLine, Activity, Biohazard, FileText, ClipboardCheck, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WarehouseManagementSection() {
  const { toast } = useToast();

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
          <Warehouse className="h-6 w-6 mr-2 text-primary" />
          <CardTitle className="text-xl font-semibold text-foreground font-headline">Warehouse Management</CardTitle>
        </div>
        <CardDescription>Optimize storage, handling, and safety within the warehouse.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible defaultValue="advanced-slotting">
          <AccordionItem value="advanced-slotting">
            <AccordionTrigger className="text-md font-medium hover:no-underline">
                <div className="flex items-center">
                    <ScanLine className="h-5 w-5 mr-2 text-primary/80" /> Advanced Slotting
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label htmlFor="barcodeRfidInput" className="text-sm">Barcode/RFID Directed Putaway</Label>
                <div className="flex space-x-2 mt-1">
                  <Input id="barcodeRfidInput" placeholder="Scan Barcode/RFID or Enter ID" />
                  <Button variant="outline" onClick={() => handleMockAction('Directed Putaway Scan')}>Suggest Slot</Button>
                </div>
              </div>
              <div>
                <Label className="text-sm">ABC Analysis</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox id="runAbcAnalysis" />
                  <Label htmlFor="runAbcAnalysis" className="text-sm font-normal">Perform ABC Analysis for Slotting Optimization</Label>
                </div>
                <Button className="mt-2 w-full" onClick={() => handleMockAction('Run ABC Analysis')}>
                  <Activity className="mr-2 h-4 w-4" /> Run Analysis & Re-slot
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hazardous-material">
            <AccordionTrigger className="text-md font-medium hover:no-underline">
                <div className="flex items-center">
                    <Biohazard className="h-5 w-5 mr-2 text-primary/80" /> Hazardous Material Handling
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label htmlFor="sdsSheet" className="text-sm">SDS Sheet Integration</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input id="sdsSheet" type="file" className="flex-1" />
                   <Button variant="outline" size="icon" onClick={() => handleMockAction('Upload SDS Sheet')}>
                    <UploadCloud className="h-4 w-4" />
                  </Button>
                </div>
                 <Button className="mt-2 w-full" onClick={() => handleMockAction('Link SDS to Material ID')}>
                  <FileText className="mr-2 h-4 w-4" /> Link SDS to Material
                </Button>
              </div>
              <div>
                <Label htmlFor="dgDeclaration" className="text-sm">Dangerous Goods (DG) Declaration Automation</Label>
                <Input id="materialIdForDg" placeholder="Enter Material ID for DG Declaration" className="mt-1" />
                <Button className="mt-2 w-full" onClick={() => handleMockAction('Automate DG Declaration')}>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Generate DG Declaration
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Warehouse features are illustrative. Full implementation requires backend systems and AI flows.</p>
      </CardFooter>
    </Card>
  );
}
