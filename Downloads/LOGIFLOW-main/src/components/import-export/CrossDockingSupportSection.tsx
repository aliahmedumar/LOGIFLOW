
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shuffle, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CrossDockingSupportSection() {
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
          <Shuffle className="h-6 w-6 mr-2 text-primary" />
          <CardTitle className="text-xl font-semibold text-foreground font-headline">Cross-Docking Support</CardTitle>
        </div>
        <CardDescription>Manage blind shipments and 3PL operations efficiently.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Blind Shipment Handling</Label>
          <div className="space-y-2 mt-1">
            <Input placeholder="Original Shipper Details (Hidden)" />
            <Input placeholder="Actual Consignee (End Customer)" />
            <Input placeholder="Intermediary / 3PL Details" />
          </div>
          <Button variant="outline" className="mt-2 w-full" onClick={() => handleMockAction('Blind Shipment Configuration')}>
            <Settings2 className="mr-2 h-4 w-4" /> Configure Blind Shipment
          </Button>
          <p className="text-xs text-muted-foreground mt-1">Note: Requires system-level logic to manage data visibility.</p>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Cross-docking functionality is for demonstration purposes.</p>
      </CardFooter>
    </Card>
  );
}
