
// src/app/dashboard/air-export/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane } from "lucide-react";
import Link from "next/link";

export default function AirExportDashboardPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center">
          <Plane className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
            Air Export Dashboard
          </h1>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground font-headline">
            Air Export Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage and track your air export shipments.
          </p>
          <p className="text-muted-foreground">
            Navigate to specific functionalities like{" "}
            <Link href="/dashboard/air-export/ae-job" className="text-primary hover:underline font-medium">
              AE Job
            </Link>{" "}
            for detailed job management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
