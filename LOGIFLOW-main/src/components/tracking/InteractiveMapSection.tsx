
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button'; 

interface Container {
  id: string;
  status: 'In Transit' | 'Delayed' | 'At Port' | 'Delivered';
  currentLocation: string;
  estimatedArrival: string;
  lastUpdated: string;
}

export function InteractiveMapSection() {
  const [trackedContainers, setTrackedContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainerData = async () => {
    setIsLoading(true);
    try {
      setError(null); // Clear previous error on new attempt
      const response = await fetch('/api/tracking');
      if (!response.ok) {
        let errorJson = null;
        try {
          errorJson = await response.json();
        } catch (e) { 
          // Ignore if response body is not JSON
        }
        
        const serverErrorMsg = errorJson?.error || errorJson?.message || (errorJson ? JSON.stringify(errorJson) : '');
        const statusText = response.statusText || '(No status text)';
        
        let detailedMessage = `Server responded with ${response.status} ${statusText}.`;
        if (serverErrorMsg) {
          detailedMessage += ` Details: ${serverErrorMsg}`;
        }
        throw new Error(`Failed to fetch tracking data. ${detailedMessage}`);
      }
      const data: Container[] = await response.json();
      setTrackedContainers(data);
    } catch (err) {
      console.error("Error fetching container data (raw):", err);
      let displayErrorMessage = "An unknown error occurred while fetching data.";
      if (err instanceof Error) {
        if (err.message === "Failed to fetch") {
          displayErrorMessage = "Network error: Could not connect to the tracking service. Please check your internet connection or if the server is running.";
        } else {
          displayErrorMessage = err.message; // Use the error message from other types of errors
        }
      }
      setError(displayErrorMessage);
      console.error("Error fetching container data (processed for display):", displayErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContainerData(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchContainerData();
    }, 7000); // Poll every 7 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const getStatusBadgeVariant = (status: Container['status']) => {
    switch (status) {
      case 'In Transit':
        return 'default' as const;
      case 'At Port':
        return 'secondary' as const;
      case 'Delivered':
        return 'outline' as const; 
      case 'Delayed':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <section aria-labelledby="interactive-map-title">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle id="interactive-map-title" className="text-xl font-semibold text-foreground font-headline">
            Container Tracking
          </CardTitle>
          <MapPin className="h-6 w-6 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center p-4 overflow-hidden">
            <Image
              src="/Three%20Semi-Trucks%20With%20Red%20And%20White%20Colors%20At%20Warehouse.png"
              alt="Three Semi-Trucks with Red and White Colors at Warehouse"
              width={600}
              height={350}
              className="rounded-md object-cover object-top"
              style={{ objectPosition: 'center 30%' }}
              priority
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Live Container Status</h3>
            {isLoading && trackedContainers.length === 0 && ( // Show loader only if no data yet
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading tracking data...</p>
              </div>
            )}
            {error && ( // Always show error if present
              <p className="text-destructive text-sm p-4 bg-destructive/10 rounded-md">{error}</p>
            )}
            {!error && trackedContainers.length > 0 && ( // Show data if no error and data exists
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {trackedContainers.map(container => (
                  <div key={container.id} className="p-3 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-md font-semibold text-primary">{container.id}</h4>
                      <Badge variant={getStatusBadgeVariant(container.status)} className={container.status === 'Delivered' ? 'border-green-500 text-green-600' : ''}>
                        {container.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Location:</span> {container.currentLocation}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">ETA:</span> {new Date(container.estimatedArrival).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Last Update: {new Date(container.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
             {!isLoading && !error && trackedContainers.length === 0 && ( // No data, no error, not loading
                <p className="text-muted-foreground text-sm p-4">No containers currently being tracked or data available.</p>
             )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
