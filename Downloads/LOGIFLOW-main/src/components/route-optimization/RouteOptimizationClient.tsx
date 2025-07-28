'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { optimizeDeliveryRoutes, OptimizeDeliveryRoutesInput, OptimizeDeliveryRoutesOutput } from '@/ai/flows/optimize-delivery-routes';
import { Waypoints, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RouteOptimizationClient() {
  const [formData, setFormData] = useState<Partial<OptimizeDeliveryRoutesInput>>({
    startLocation: '',
    destinations: [],
    trafficConditions: 'Moderate',
    weatherConditions: '',
    deliverySchedules: '',
  });
  const [destinationsInput, setDestinationsInput] = useState('');
  const [result, setResult] = useState<OptimizeDeliveryRoutesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDestinationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDestinationsInput(e.target.value);
    const destinationsArray = e.target.value.split('\n').map(d => d.trim()).filter(d => d !== '');
    setFormData({ ...formData, destinations: destinationsArray });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    if (!formData.startLocation || !formData.destinations || formData.destinations.length === 0) {
      setError("Start location and at least one destination are required.");
      setIsLoading(false);
      toast({
        title: "Input Error",
        description: "Start location and at least one destination are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await optimizeDeliveryRoutes(formData as OptimizeDeliveryRoutesInput);
      setResult(response);
      toast({
        title: "Route Optimized!",
        description: "Successfully generated an optimized delivery route.",
        variant: "default",
        className: "bg-green-500 text-white"
      });
    } catch (err) {
      console.error("Error optimizing route:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to optimize route: ${errorMessage}`);
      toast({
        title: "Optimization Failed",
        description: `Could not optimize route: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground font-headline">AI Route Optimization</CardTitle>
          <Waypoints className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Enter delivery details to get an optimized route.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="startLocation">Start Location</Label>
            <Input id="startLocation" name="startLocation" value={formData.startLocation || ''} onChange={handleChange} placeholder="e.g., Warehouse A, 123 Main St" required />
          </div>
          <div>
            <Label htmlFor="destinations">Destinations (one per line)</Label>
            <Textarea id="destinations" name="destinations" value={destinationsInput} onChange={handleDestinationsChange} placeholder="e.g., Customer X, 456 Oak Ave\nCustomer Y, 789 Pine Rd" rows={3} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trafficConditions">Traffic Conditions</Label>
              <Select name="trafficConditions" value={formData.trafficConditions} onValueChange={(value) => handleSelectChange('trafficConditions', value)}>
                <SelectTrigger id="trafficConditions">
                  <SelectValue placeholder="Select traffic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weatherConditions">Weather Conditions</Label>
              <Input id="weatherConditions" name="weatherConditions" value={formData.weatherConditions || ''} onChange={handleChange} placeholder="e.g., Sunny, Light rain" />
            </div>
          </div>
          <div>
            <Label htmlFor="deliverySchedules">Delivery Schedules/Time Windows</Label>
            <Textarea id="deliverySchedules" name="deliverySchedules" value={formData.deliverySchedules || ''} onChange={handleChange} placeholder="e.g., Customer X: 9am-12pm, Customer Y: 2pm-5pm" rows={2} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Waypoints className="mr-2 h-4 w-4" />}
            Optimize Route
          </Button>

          {error && (
            <div className="text-red-500 flex items-center text-sm">
              <AlertTriangle className="mr-2 h-4 w-4" /> {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 border rounded-md bg-secondary w-full space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-500" />Optimized Route Details</h3>
              <div>
                <p className="font-medium text-muted-foreground">Route:</p>
                <ul className="list-disc list-inside pl-4 text-sm text-foreground">
                  {result.optimizedRoute.map((stop, index) => <li key={index}>{stop}</li>)}
                </ul>
              </div>
              <p className="text-sm"><span className="font-medium text-muted-foreground">Estimated Delivery Time:</span> {result.estimatedDeliveryTime}</p>
              <p className="text-sm"><span className="font-medium text-muted-foreground">Estimated Cost Savings:</span> {result.estimatedCostSavings}</p>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
