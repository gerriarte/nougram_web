"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart } from '@/components/charts/area-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { formatCurrency } from '@/lib/currency';
import type { MonthlySummary } from '@/lib/types/annual-projection';

interface ProjectionChartsProps {
  summary: MonthlySummary[];
  breakEvenMonthlyCost: string; // Decimal as string
  currency?: string;
}

export function ProjectionCharts({ summary, breakEvenMonthlyCost, currency = 'USD' }: ProjectionChartsProps) {
  const breakEven = parseFloat(breakEvenMonthlyCost);

  // Prepare data for revenue vs break-even chart
  const revenueVsBreakEvenData = summary.map((month) => ({
    month: month.month_name,
    'Ingresos Proyectados': parseFloat(month.total_revenue),
    'Break-Even': breakEven,
  }));

  // Prepare data for monthly revenue breakdown by service (stacked bar chart)
  // Group by service and sum across all months
  const serviceRevenueMap = new Map<string, number>();
  summary.forEach(month => {
    month.service_breakdown.forEach(service => {
      const current = serviceRevenueMap.get(service.service_name) || 0;
      serviceRevenueMap.set(service.service_name, current + parseFloat(service.revenue));
    });
  });

  const serviceBreakdownData = Array.from(serviceRevenueMap.entries()).map(([service, revenue]) => ({
    service,
    revenue,
  })).sort((a, b) => b.revenue - a.revenue);

  // Calculate capacity utilization (simplified - would need team capacity data)
  const capacityData = summary.map((month) => ({
    month: month.month_name,
    'Horas Proyectadas': month.total_hours,
    // This would need actual team capacity data
    'Capacidad Disponible': month.total_hours * 1.2, // Placeholder
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs. Break-Even</CardTitle>
          <CardDescription>
            Comparación de ingresos proyectados con el punto de equilibrio mensual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={revenueVsBreakEvenData}
            dataKeys={['Ingresos Proyectados', 'Break-Even']}
            colors={['#0088FE', '#FF6B6B']}
            height={300}
            currency={currency}
            formatter={(value) => formatCurrency(value, currency)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingresos Totales por Servicio</CardTitle>
          <CardDescription>
            Ingresos proyectados anuales desglosados por servicio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            data={serviceBreakdownData}
            height={300}
            currency={currency}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Utilización de Capacidad</CardTitle>
          <CardDescription>
            Horas proyectadas vs. capacidad disponible del equipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={capacityData}
            dataKeys={['Horas Proyectadas', 'Capacidad Disponible']}
            colors={['#00C49F', '#FFBB28']}
            height={300}
            formatter={(value) => `${value.toFixed(1)}h`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
