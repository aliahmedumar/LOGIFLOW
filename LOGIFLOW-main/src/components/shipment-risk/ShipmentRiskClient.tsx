
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { forecastShipmentRisk, ForecastShipmentRiskInput, ForecastShipmentRiskOutput } from '@/ai/flows/forecast-shipment-risk-flow';
import { ShieldAlert, Loader2, CheckCircle, AlertTriangle, TrendingUp, ListChecks, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function ShipmentRiskClient() {
  const [formData, setFormData] = useState<Partial<ForecastShipmentRiskInput>>({
    shipmentId: 'CONU7890123',
    currentStatus: 'In Transit',
    originPort: 'Shanghai, China',
    destinationPort: 'Los Angeles, USA',
    carrier: 'Global Shipping Co.',
    estimatedTimeOfArrival: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ETA 15 days from now
    historicalDataSummary: 'Minor delays (1-2 days) common on this route during peak season. Carrier has 90% on-time record.',
  });
  const [result, setResult] = useState<ForecastShipmentRiskOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const requiredFields: (keyof ForecastShipmentRiskInput)[] = ['shipmentId', 'currentStatus', 'originPort', 'destinationPort', 'carrier', 'estimatedTimeOfArrival'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        const friendlyName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        setError(`${friendlyName} is required.`);
        setIsLoading(false);
        toast({
          title: "Input Error",
          description: `${friendlyName} is required.`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const response = await forecastShipmentRisk(formData as ForecastShipmentRiskInput);
      setResult(response);
      toast({
        title: "Risk Forecast Generated!",
        description: "Successfully analyzed shipment risk.",
        variant: "default",
        className: "bg-green-500 text-white"
      });
    } catch (err) {
      console.error("Error forecasting risk:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to forecast risk: ${errorMessage}`);
      toast({
        title: "Forecast Failed",
        description: `Could not forecast risk: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadgeVariant = (level: 'Low' | 'Medium' | 'High' | undefined): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (level === 'Low') return 'default'; 
    if (level === 'Medium') return 'secondary'; 
    if (level === 'High') return 'destructive';
    return 'outline';
  };
  
  const getRiskTextColor = (level: 'Low' | 'Medium' | 'High' | undefined) => {
    if (level === 'Low') return 'text-green-600 dark:text-green-400';
    if (level === 'Medium') return 'text-yellow-600 dark:text-yellow-400';
    if (level === 'High') return 'text-red-600 dark:text-red-400';
    return 'text-foreground';
  };

  const getRiskProgressColorClass = (level: 'Low' | 'Medium' | 'High' | undefined) => {
    if (level === 'Low') return 'bg-green-500';
    if (level === 'Medium') return 'bg-yellow-500';
    if (level === 'High') return 'bg-red-500';
    return 'bg-primary'; 
  };


  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle id="shipment-risk-title" className="text-xl font-semibold text-foreground font-headline">Shipment Risk Forecasting</CardTitle>
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Enter shipment details to predict potential delays or exceptions using AI.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipmentId">Shipment ID</Label>
              <Input id="shipmentId" name="shipmentId" value={formData.shipmentId || ''} onChange={handleChange} placeholder="e.g., CONU1234567" required />
            </div>
            <div>
              <Label htmlFor="currentStatus">Current Status</Label>
              <Input id="currentStatus" name="currentStatus" value={formData.currentStatus || ''} onChange={handleChange} placeholder="e.g., In Transit, At Customs, Delayed" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="originPort">Origin Port</Label>
              <Input id="originPort" name="originPort" value={formData.originPort || ''} onChange={handleChange} placeholder="e.g., Shanghai, China" required />
            </div>
            <div>
              <Label htmlFor="destinationPort">Destination Port</Label>
              <Input id="destinationPort" name="destinationPort" value={formData.destinationPort || ''} onChange={handleChange} placeholder="e.g., Los Angeles, USA" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="carrier">Carrier</Label>
              <Input id="carrier" name="carrier" value={formData.carrier || ''} onChange={handleChange} placeholder="e.g., Global Shipping Co." required />
            </div>
             <div>
              <Label htmlFor="estimatedTimeOfArrival">Original ETA</Label>
              <Input id="estimatedTimeOfArrival" name="estimatedTimeOfArrival" type="date" value={formData.estimatedTimeOfArrival || ''} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <Label htmlFor="historicalDataSummary">Historical Data / Contextual Notes (Optional)</Label>
            <Textarea 
              id="historicalDataSummary" 
              name="historicalDataSummary" 
              value={formData.historicalDataSummary || ''} 
              onChange={handleChange} 
              placeholder="e.g., Known port congestion at destination, carrier's on-time performance for this lane, recent weather alerts..." 
              rows={3} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
            Forecast Risk
          </Button>

          {error && (
            <div className="text-red-500 flex items-center text-sm p-3 bg-destructive/10 rounded-md w-full">
              <AlertTriangle className="mr-2 h-4 w-4" /> {error}
            </div>
          )}

          {result && (
            <Card className="mt-6 w-full bg-secondary shadow-inner">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />Risk Forecast Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Label className="text-sm text-muted-foreground">Overall Risk Level</Label>
                        <Badge variant={getRiskBadgeVariant(result.riskLevel)} className={`text-lg px-3 py-1 mt-1 ${getRiskTextColor(result.riskLevel)}`}>
                            {result.riskLevel}
                        </Badge>
                    </div>
                    {result.confidenceScore !== undefined && (
                        <div className="w-full sm:w-1/2">
                        <Label className="text-sm text-muted-foreground">Confidence Score</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Progress 
                                value={result.confidenceScore * 100} 
                                className="h-3 flex-1"
                                indicatorClassName={getRiskProgressColorClass(result.riskLevel)}
                            />
                            <span className={`text-sm font-semibold ${getRiskTextColor(result.riskLevel)}`}>
                                {(result.confidenceScore * 100).toFixed(0)}%
                            </span>
                        </div>
                        </div>
                    )}
                </div>
                
                <Separator />

                {result.potentialIssues && result.potentialIssues.length > 0 && (
                  <div>
                    <Label className="font-medium text-foreground flex items-center"><AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />Potential Issues</Label>
                    <ul className="list-disc list-inside pl-5 mt-1 space-y-1 text-sm text-muted-foreground">
                      {result.potentialIssues.map((issue, index) => <li key={index}>{issue}</li>)}
                    </ul>
                  </div>
                )}

                {result.recommendedActions && result.recommendedActions.length > 0 && (
                  <div>
                    <Label className="font-medium text-foreground flex items-center"><ListChecks className="mr-2 h-5 w-5 text-blue-500" />Recommended Actions</Label>
                    <ul className="list-disc list-inside pl-5 mt-1 space-y-1 text-sm text-muted-foreground">
                      {result.recommendedActions.map((action, index) => <li key={index}>{action}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
