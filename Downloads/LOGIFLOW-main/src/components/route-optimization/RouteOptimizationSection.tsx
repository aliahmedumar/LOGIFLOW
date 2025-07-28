import { RouteOptimizationClient } from './RouteOptimizationClient';

export function RouteOptimizationSection() {
  return (
    <section aria-labelledby="route-optimization-title">
      {/* The title is handled within RouteOptimizationClient's CardHeader */}
      <RouteOptimizationClient />
    </section>
  );
}
