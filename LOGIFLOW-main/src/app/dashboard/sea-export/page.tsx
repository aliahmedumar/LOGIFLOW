
// src/app/dashboard/sea-export/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship } from "lucide-react";
import Link from "next/link";

export default function SeaExportDashboardPage() {
  // Add permission check here in a real app
  // For example:
  // const { user } = useAuth();
  // if (!user || !user.permissions.includes('sea_export')) {
  //   return <div className="p-6">Access Denied. You do not have permission to view this page.</div>;
  // }
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center">
          <Ship className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
            Sea Export Dashboard
          </h1>
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground font-headline">
            Sea Export Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Manage and track your sea export shipments. This is the main dashboard for the Sea Export module.
          </p>
          <p className="text-muted-foreground">
            Navigate to specific functionalities like {" "}
            <Link href="/dashboard/sea-export/se-job" className="text-primary hover:underline font-medium">
              SE Job
            </Link>{" "}
            for detailed job management.
          </p>
          {/* Placeholder for future dashboard content like charts, summaries etc. */}
          <div className="mt-6 p-6 border rounded-md bg-secondary/30">
            <h3 className="text-lg font-semibold mb-2">Key Metrics (Placeholder)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Total Active Shipments: 120</li>
                <li>Bookings this Week: 15</li>
                <li>Pending Documentation: 5</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
