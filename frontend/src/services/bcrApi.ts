/**
 * BCR (Blended Cost Rate) API - Single source of truth from backend.
 */
import { apiGet, getToken } from '@/lib/api-client';

export interface BCRResponse {
  blended_cost_rate: string;
  total_monthly_costs: string;
  total_fixed_overhead: string;
  total_tools_costs: string;
  total_salaries: string;
  total_monthly_hours: number;
  active_team_members: number;
  primary_currency: string;
}

export async function fetchBCR(): Promise<BCRResponse | null> {
  if (!getToken()) return null;
  try {
    const res = await apiGet<BCRResponse>('/settings/calculations/agency-cost-hour');
    return res.data ?? null;
  } catch {
    return null;
  }
}
