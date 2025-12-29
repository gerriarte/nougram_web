/**
 * Types for sales projection (Sprint 18)
 */

export interface SalesProjectionRequest {
  service_ids: number[]
  estimated_hours_per_service: Record<string, number>
  win_rate?: number
  scenario?: "conservative" | "realistic" | "optimistic"
  period_months?: number
  currency?: string
}

export interface ServiceProjection {
  service_id: number
  service_name: string
  estimated_hours: number
  base_price: number
  cost: number
  projected_revenue: number
  projected_cost: number
  projected_profit: number
  margin: number
}

export interface MonthlyProjection {
  month: number
  revenue: number
  costs: number
  profit: number
  margin_percentage: number
}

export interface SalesProjectionSummary {
  total_revenue: number
  total_costs: number
  total_profit: number
  overall_margin_percentage: number
  capacity_utilization_percentage: number
  total_estimated_hours: number
  hours_per_month: number
}

export interface SalesProjectionResponse {
  scenario: string
  period_months: number
  win_rate: number
  currency: string
  bcr: number
  total_billable_hours_per_month: number
  service_projections: ServiceProjection[]
  monthly_projections: MonthlyProjection[]
  summary: SalesProjectionSummary
}

