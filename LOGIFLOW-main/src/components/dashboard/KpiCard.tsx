import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: string; // e.g., "+5% from last month"
  trendDirection?: 'up' | 'down' | 'neutral';
}

export function KpiCard({ title, value, icon: Icon, description, trend, trendDirection = 'neutral' }: KpiCardProps) {
  const trendColor = trendDirection === 'up' ? 'text-green-500' : trendDirection === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
        {trend && <p className={cn("text-xs pt-1", trendColor)}>{trend}</p>}
      </CardContent>
    </Card>
  );
}
