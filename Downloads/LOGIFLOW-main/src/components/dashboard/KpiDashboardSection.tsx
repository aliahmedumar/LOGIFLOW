import { KpiCard } from './KpiCard';
import { Ship, Clock, DollarSign, Smile } from 'lucide-react';

export function KpiDashboardSection() {
  const kpis = [
    { title: 'Total Shipments', value: '1,234', icon: Ship, description: 'Active and completed shipments', trend: '+12% from last month', trendDirection: 'up' as const },
    { title: 'On-Time Delivery', value: '92.5%', icon: Clock, description: 'Percentage of deliveries on schedule', trend: '-0.5% from last month', trendDirection: 'down' as const },
    { title: 'Average Shipping Cost', value: '$245.67', icon: DollarSign, description: 'Per shipment unit', trend: '+2.1% from last month', trendDirection: 'up' as const },
    { title: 'Customer Satisfaction', value: '4.8/5', icon: Smile, description: 'Based on recent surveys', trend: 'Stable', trendDirection: 'neutral' as const },
  ];

  return (
    <section aria-labelledby="kpi-dashboard-title">
      <h2 id="kpi-dashboard-title" className="text-2xl font-semibold text-foreground mb-6 font-headline">
        Key Performance Indicators
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>
    </section>
  );
}
