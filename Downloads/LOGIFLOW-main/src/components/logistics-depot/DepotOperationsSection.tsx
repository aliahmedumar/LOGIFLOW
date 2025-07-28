
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Container, Wrench, CalendarClock, Droplets, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DepotOperationsSection() {
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
          <Container className="h-6 w-6 mr-2 text-primary" />
          <CardTitle className="text-xl font-semibold text-foreground font-headline">Depot Operations</CardTitle>
        </div>
        <CardDescription>Manage container upkeep and specialized services.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible defaultValue="container-maintenance">
          <AccordionItem value="container-maintenance">
            <AccordionTrigger className="text-md font-medium hover:no-underline">
                <div className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-primary/80" /> Container Maintenance Tracking
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label htmlFor="containerIdMaintenance" className="text-sm">Container ID</Label>
                <div className="flex space-x-2 mt-1">
                  <Input id="containerIdMaintenance" placeholder="Enter Container ID (e.g., MSCU1234567)" />
                  <Button variant="outline" onClick={() => handleMockAction('Fetch Maintenance Log')}>
                    <Search className="mr-2 h-4 w-4" /> View Log
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="maintenanceNotes" className="text-sm">Add Maintenance Note</Label>
                <Textarea id="maintenanceNotes" placeholder="Describe maintenance performed or required..." className="mt-1" rows={3}/>
                <Button className="mt-2 w-full" onClick={() => handleMockAction('Log Container Maintenance')}>
                  Log Maintenance
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tank-cleaning">
            <AccordionTrigger className="text-md font-medium hover:no-underline">
                <div className="flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-primary/80" /> Tank Cleaning Scheduling
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div>
                <Label htmlFor="tankIdCleaning" className="text-sm">Tank ID / Container ID</Label>
                <Input id="tankIdCleaning" placeholder="Enter Tank/Container ID" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="cleaningDate" className="text-sm">Schedule Cleaning Date</Label>
                <Input id="cleaningDate" type="date" className="mt-1" />
              </div>
              <Button className="mt-2 w-full" onClick={() => handleMockAction('Schedule Tank Cleaning')}>
                <CalendarClock className="mr-2 h-4 w-4" /> Schedule Cleaning
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Depot operation features are for demonstration. Real-world use requires robust backend and database integration.</p>
      </CardFooter>
    </Card>
  );
}
