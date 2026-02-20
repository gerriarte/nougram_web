/**
 * Admin API service - Team (Nómina) and Fixed Costs (Overhead)
 * Connects to backend for unified BCR source of truth.
 */
import { apiGet, apiPost, apiPut, apiDelete, getToken } from '@/lib/api-client';
import type { TeamMember, FixedCost } from '@/types/admin';

// --- Backend response types ---
interface TeamMemberResponse {
  id: number;
  name: string;
  role: string;
  salary_monthly_brute: string;
  currency: string;
  billable_hours_per_week: number;
  is_active?: boolean;
  non_billable_hours_percentage?: string;
}

interface TeamMemberListResponse {
  items: TeamMemberResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface CostFixedResponse {
  id: number;
  name: string;
  amount_monthly: string;
  currency: string;
  category: string;
  description?: string;
}

interface CostFixedListResponse {
  items: CostFixedResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// --- Mappers ---
function mapTeamMemberFromApi(r: TeamMemberResponse): TeamMember {
  const salary = parseFloat(r.salary_monthly_brute) || 0;
  const nonBillable = r.non_billable_hours_percentage
    ? parseFloat(r.non_billable_hours_percentage)
    : 0.2;
  return {
    id: String(r.id),
    name: r.name,
    role: r.role,
    salaryMonthlyBrute: salary,
    currency: (r.currency as 'COP' | 'USD' | 'EUR') || 'COP',
    applySocialCharges: true,
    salaryWithCharges: salary, // Recalculated in context
    billableHoursPerWeek: r.billable_hours_per_week ?? 32,
    nonBillablePercentage: nonBillable,
    vacationDaysPerYear: 15,
    isActive: r.is_active ?? true,
  };
}

function mapFixedCostFromApi(r: CostFixedResponse): FixedCost {
  return {
    id: String(r.id),
    name: r.name,
    category: r.category as FixedCost['category'],
    amountMonthly: parseFloat(r.amount_monthly) || 0,
    currency: (r.currency as 'COP' | 'USD' | 'EUR') || 'COP',
    isActive: true,
  };
}

// --- API helpers ---
function hasAuth(): boolean {
  return !!getToken();
}

async function fetchAllTeamMembers(): Promise<TeamMember[]> {
  const pageSize = 100;
  const res = await apiGet<TeamMemberListResponse>(
    `/settings/team?page=1&page_size=${pageSize}`
  );
  return (res.items || []).map(mapTeamMemberFromApi);
}

async function fetchAllFixedCosts(): Promise<FixedCost[]> {
  const pageSize = 100;
  const res = await apiGet<CostFixedListResponse>(
    `/settings/costs/fixed?page=1&page_size=${pageSize}`
  );
  return (res.items || []).map(mapFixedCostFromApi);
}

// --- Public API ---
export const adminApi = {
  hasAuth,

  async getTeamMembers(): Promise<TeamMember[]> {
    return fetchAllTeamMembers();
  },

  async createTeamMember(data: Omit<TeamMember, 'id' | 'salaryWithCharges'>): Promise<TeamMember> {
    const body = {
      name: data.name,
      role: data.role,
      salary_monthly_brute: String(data.salaryMonthlyBrute),
      currency: data.currency,
      billable_hours_per_week: data.billableHoursPerWeek ?? 32,
      is_active: data.isActive ?? true,
    };
    const res = await apiPost<TeamMemberResponse>('/settings/team', body);
    return mapTeamMemberFromApi(res);
  },

  async updateTeamMember(
    id: string,
    data: Partial<Omit<TeamMember, 'id' | 'salaryWithCharges'>>
  ): Promise<TeamMember> {
    const body: Record<string, unknown> = {};
    if (data.name != null) body.name = data.name;
    if (data.role != null) body.role = data.role;
    if (data.salaryMonthlyBrute != null) body.salary_monthly_brute = String(data.salaryMonthlyBrute);
    if (data.currency != null) body.currency = data.currency;
    if (data.billableHoursPerWeek != null) body.billable_hours_per_week = data.billableHoursPerWeek;
    if (data.isActive != null) body.is_active = data.isActive;

    const res = await apiPut<TeamMemberResponse>(`/settings/team/${id}`, body);
    return mapTeamMemberFromApi(res);
  },

  async deleteTeamMember(id: string): Promise<void> {
    await apiDelete(`/settings/team/${id}`);
  },

  async getFixedCosts(): Promise<FixedCost[]> {
    return fetchAllFixedCosts();
  },

  async createFixedCost(data: Omit<FixedCost, 'id'>): Promise<FixedCost> {
    const body = {
      name: data.name,
      amount_monthly: String(data.amountMonthly),
      currency: data.currency,
      category: data.category,
      description: data.description ?? '',
    };
    const res = await apiPost<CostFixedResponse>('/settings/costs/fixed', body);
    return mapFixedCostFromApi(res);
  },

  async updateFixedCost(id: string, data: Partial<Omit<FixedCost, 'id'>>): Promise<FixedCost> {
    const body: Record<string, unknown> = {};
    if (data.name != null) body.name = data.name;
    if (data.amountMonthly != null) body.amount_monthly = String(data.amountMonthly);
    if (data.currency != null) body.currency = data.currency;
    if (data.category != null) body.category = data.category;
    if (data.description != null) body.description = data.description;

    const res = await apiPut<CostFixedResponse>(`/settings/costs/fixed/${id}`, body);
    return mapFixedCostFromApi(res);
  },

  async deleteFixedCost(id: string): Promise<void> {
    await apiDelete(`/settings/costs/fixed/${id}`);
  },
};
