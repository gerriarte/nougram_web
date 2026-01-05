"use client";

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { MonthlySummary } from '@/lib/types/annual-projection';

interface CapacityAlertsProps {
  summary: MonthlySummary[];
  breakEvenMonthlyCost: string; // Decimal as string
  totalAnnualHours: number;
  estimatedCapacity?: number; // Total team capacity in hours per month
  currency?: string;
}

export function CapacityAlerts({
  summary,
  breakEvenMonthlyCost,
  totalAnnualHours,
  estimatedCapacity,
  currency = 'USD',
}: CapacityAlertsProps) {
  const breakEven = parseFloat(breakEvenMonthlyCost);
  const monthlyCapacity = estimatedCapacity || (totalAnnualHours / 12) * 1.2; // Estimate if not provided
  const alerts: Array<{ type: 'error' | 'warning' | 'success'; message: string }> = [];

  // Check each month
  summary.forEach((month) => {
    const revenue = parseFloat(month.total_revenue);
    const hours = month.total_hours;
    const utilization = monthlyCapacity > 0 ? (hours / monthlyCapacity) * 100 : 0;

    // Break-even check
    if (revenue < breakEven) {
      alerts.push({
        type: 'error',
        message: `${month.month_name}: Ingresos proyectados (${formatCurrency(revenue, currency)}) están por debajo del break-even (${formatCurrency(breakEven, currency)})`,
      });
    }

    // Capacity checks
    if (utilization < 70) {
      alerts.push({
        type: 'warning',
        message: `${month.month_name}: Capacidad ociosa (${utilization.toFixed(0)}% utilización). Horas proyectadas: ${hours.toFixed(1)}h`,
      });
    } else if (utilization > 100) {
      alerts.push({
        type: 'error',
        message: `${month.month_name}: Capacidad excedida (${utilization.toFixed(0)}% utilización). Horas proyectadas: ${hours.toFixed(1)}h vs. capacidad: ${monthlyCapacity.toFixed(1)}h`,
      });
    }
  });

  // Overall annual check
  const avgMonthlyRevenue = summary.reduce((sum, m) => sum + parseFloat(m.total_revenue), 0) / 12;
  if (avgMonthlyRevenue < breakEven) {
    alerts.push({
      type: 'warning',
      message: `Promedio mensual de ingresos (${formatCurrency(avgMonthlyRevenue, currency)}) está por debajo del break-even mensual`,
    });
  }

  if (alerts.length === 0) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle>Todo en orden</AlertTitle>
        <AlertDescription>
          La proyección está dentro de los parámetros esperados. Los ingresos proyectados superan el break-even y la utilización de capacidad es adecuada.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          variant={alert.type === 'error' ? 'destructive' : 'default'}
          className={alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : ''}
        >
          {alert.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : alert.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
