// src/app/dashboard/air-import/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane } from "lucide-react";
import Link from "next/link";

export default function AirImportDashboardPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center">
          <Plane className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
            Air Import Dashboard
          </h1>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground font-headline">
            Air Import Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage and track your air import shipments.
          </p>
          <p className="text-muted-foreground">
            Navigate to specific functionalities like{" "}
            <Link href="/dashboard/air-import/ai-invoice" className="text-primary hover:underline font-medium">
              AI Invoice
            </Link>{" "}
            for detailed invoice management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
