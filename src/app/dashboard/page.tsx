
import { KpiDashboardSection } from '@/components/dashboard/KpiDashboardSection';
import { InteractiveMapSection } from '@/components/tracking/InteractiveMapSection';
import { RouteOptimizationSection } from '@/components/route-optimization/RouteOptimizationSection';
import { DocumentGenerationSection } from '@/components/document-generation/DocumentGenerationSection';
import { DocumentAnalysisSection } from '@/components/document-analysis/DocumentAnalysisSection';
import { LogisticsChatSection } from '@/components/logistics-chat/LogisticsChatSection';
import { ShipmentRiskSection } from '@/components/shipment-risk/ShipmentRiskSection';
import { ContractReviewSection } from '@/components/contract-review/ContractReviewSection';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
          LogiFlow Dashboard
        </h1>
      </div>
      
      <KpiDashboardSection />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2"> <InteractiveMapSection /> </div>
        <RouteOptimizationSection />
        <DocumentGenerationSection />
        <DocumentAnalysisSection />
        <LogisticsChatSection />
        <ShipmentRiskSection />
        <ContractReviewSection/>
      </div>
      
    </div>
  );
}
