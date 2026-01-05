/**
 * TypeScript types for Annual Sales Projections (Sprint 20)
 */

export interface AnnualSalesProjectionEntry {
  id?: number;
  service_id: number;
  service_name: string;
  month: number;
  quantity: number;
  hours_per_unit: number;
}

export interface MonthlySummary {
  month: number;
  month_name: string;
  total_revenue: string; // Decimal as string from API
  total_hours: number;
  service_breakdown: Array<{
    service_id: number;
    service_name: string;
    quantity: number;
    hours_per_unit: number;
    total_hours: number;
    revenue: string; // Decimal as string
  }>;
}

export interface AnnualSalesProjection {
  id: number;
  organization_id: number;
  year: number;
  is_active: boolean;
  notes?: string;
  entries: AnnualSalesProjectionEntry[];
  summary: MonthlySummary[];
  total_annual_revenue: string; // Decimal as string
  total_annual_hours: number;
  break_even_monthly_cost: string; // Decimal as string
  created_at: string;
  updated_at?: string;
  created_by_id: number;
}

export interface AnnualSalesProjectionCreate {
  year: number;
  notes?: string;
  entries: Array<{
    service_id: number;
    month: number;
    quantity: number;
    hours_per_unit: number;
  }>;
}

export interface BulkUpdateEntriesRequest {
  entries: Array<{
    service_id: number;
    month: number;
    quantity: number;
    hours_per_unit: number;
  }>;
}

export interface ReplicateMonthRequest {
  source_month: number;
  target_months?: number[];
}
