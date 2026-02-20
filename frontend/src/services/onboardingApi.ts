/**
 * Onboarding API - Complete onboarding and temporary BCR calculation.
 */
import { apiPost, getToken } from '@/lib/api-client';
import type { OnboardingData } from '@/types/onboarding';

const COUNTRY_TO_CODE: Record<string, string> = {
  Colombia: 'CO',
  'Estados Unidos': 'US',
  'United States': 'US',
  Argentina: 'AR',
  México: 'MX',
  Spain: 'ES',
  España: 'ES',
  Chile: 'CL',
  Peru: 'PE',
  Perú: 'PE',
  Ecuador: 'EC',
};

function toCountryCode(country: string): string {
  const trimmed = (country || '').trim();
  if (trimmed.length <= 3) return trimmed;
  return COUNTRY_TO_CODE[trimmed] || 'CO';
}

function mapCategory(cat: string): 'rent' | 'software' | 'services' {
  const lower = (cat || '').toLowerCase();
  if (lower.includes('rent') || lower.includes('arriendo') || lower.includes('oficina')) return 'rent';
  if (lower.includes('software') || lower.includes('tool') || lower.includes('herramienta')) return 'software';
  return 'services';
}

export interface CompleteOnboardingResponse {
  success: boolean;
  message: string;
  organization_id: number;
  team_members_created: number;
  expenses_created: number;
  bcr_calculated?: string;
  organization: Record<string, unknown>;
}

export interface TemporaryBCRResponse {
  blended_cost_rate: string;
  total_monthly_costs: string;
  total_fixed_overhead: string;
  total_salaries: string;
  total_monthly_hours: number;
  team_members_count: number;
  currency: string;
}

export function hasOnboardingAuth(): boolean {
  return !!getToken();
}

export async function completeOnboarding(data: OnboardingData): Promise<CompleteOnboardingResponse> {
  const country = toCountryCode(data.identity.country || 'Colombia');
  const currency = data.identity.primaryCurrency || (data.identity as any).currency || 'COP';
  const profileType = 'freelance';

  const team = data.team as { name?: string; role?: string; level?: string; salary?: number; billableHours?: number } | undefined;
  const team_members = team?.name
    ? [
        {
          name: team.name,
          role: team.role || team.level || 'Freelance',
          salary_monthly_brute: String(team.salary || 0),
          currency,
          billable_hours_per_month: Math.round((team.billableHours ?? 28) * 4.33) || 120,
        },
      ]
    : [];

  const expenses = (data.fixedCosts?.selectedTemplates || []).map((t) => ({
    name: t.name,
    category: mapCategory(t.category),
    amount_monthly: String(t.amount),
    currency: t.currency || currency,
  }));

  const body = {
    organization_name: data.identity.organizationName || undefined,
    country,
    currency,
    profile_type: profileType,
    team_members,
    expenses,
  };

  const response = await apiPost<CompleteOnboardingResponse>('/onboarding/complete', body);
  if (response.error || !response.data) {
    throw new Error(response.error || 'No se pudo completar onboarding');
  }
  return response.data;
}

export async function calculateTemporaryBCR(data: OnboardingData): Promise<TemporaryBCRResponse | null> {
  if (!getToken()) return null;
  const currency = data.identity.primaryCurrency || (data.identity as { currency?: string }).currency || 'COP';
  const team = data.team as { name?: string; role?: string; level?: string; salary?: number; billableHours?: number } | undefined;
  if (!team?.name) return null;

  const team_members = [
    {
      name: team.name,
      role: team.role || team.level || 'Freelance',
      salary_monthly_brute: String(team.salary || 0),
      currency,
      billable_hours_per_month: Math.round((team.billableHours ?? 28) * 4.33) || 120,
    },
  ];

  const expenses = (data.fixedCosts?.selectedTemplates || []).map((t) => ({
    name: t.name,
    category: mapCategory(t.category),
    amount_monthly: String(t.amount),
    currency: t.currency || currency,
  }));

  try {
    const response = await apiPost<TemporaryBCRResponse>('/onboarding/calculate-bcr', {
      team_members,
      expenses,
      currency,
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}
