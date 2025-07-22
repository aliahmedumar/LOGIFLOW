
import { WarehouseManagementSection } from '@/components/logistics-depot/WarehouseManagementSection';
import { DepotOperationsSection } from '@/components/logistics-depot/DepotOperationsSection';
import { Warehouse } from 'lucide-react';

export default function LogisticsDepotPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center">
          <Warehouse className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
            Logistics & Depot Module
          </h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WarehouseManagementSection />
        <DepotOperationsSection />
      </div>
    </div>
  );
}
