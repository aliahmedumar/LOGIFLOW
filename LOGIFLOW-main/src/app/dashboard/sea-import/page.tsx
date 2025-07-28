
// src/app/dashboard/sea-import/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Anchor } from "lucide-react";
import Link from "next/link";

export default function SeaImportDashboardPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center">
          <Anchor className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
            Sea Import Dashboard
          </h1>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground font-headline">
            Sea Import Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage and track your sea import shipments.
          </p>
          <p className="text-muted-foreground">
            Navigate to specific functionalities like{" "}
            <Link href="/dashboard/sea-import/si-job" className="text-primary hover:underline font-medium">
              SI Job
            </Link>{" "}
            or{" "}
             <Link href="/dashboard/sea-import/si-bl" className="text-primary hover:underline font-medium">
              SI B/L
            </Link>{" "}
            for detailed management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
