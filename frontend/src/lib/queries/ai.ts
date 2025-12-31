/**
 * React Query hooks for AI-powered configuration assistance
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';

// Types
export interface OnboardingSuggestionRequest {
  industry: string;
  region?: string;
  currency?: string;
  custom_context?: string;
}

export interface TeamMemberSuggestion {
  name: string;
  role: string;
  salary_monthly_brute: number;
  currency: string;
  billable_hours_per_week: number;
  is_active?: boolean;
}

export interface ServiceSuggestion {
  name: string;
  description?: string;
  default_margin_target: number;
  pricing_type: 'hourly' | 'fixed' | 'recurring' | 'project_value';
  is_active?: boolean;
}

export interface FixedCostSuggestion {
  name: string;
  amount_monthly: number;
  currency: string;
  category: string;
  description?: string;
}

export interface OnboardingSuggestionResponse {
  suggested_roles: TeamMemberSuggestion[];
  suggested_services: ServiceSuggestion[];
  suggested_fixed_costs: FixedCostSuggestion[];
  confidence_scores: {
    roles?: number;
    services?: number;
    costs?: number;
  };
  reasoning?: string;
}

/**
 * Hook to get AI-powered onboarding suggestions
 */
export function useAISuggestions() {
  return useMutation({
    mutationFn: async (request: OnboardingSuggestionRequest): Promise<OnboardingSuggestionResponse> => {
      const response = await apiRequest<OnboardingSuggestionResponse>({
        endpoint: '/ai/suggest-config',
        method: 'POST',
        body: request,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    },
    onError: (error) => {
      console.error('Error getting AI suggestions:', error);
    },
  });
}

/**
 * Hook to check AI service status
 */
export function useAIStatus() {
  return useQuery({
    queryKey: queryKeys.ai.status(),
    queryFn: async () => {
      const response = await apiRequest<{ available: boolean; message: string }>({
        endpoint: '/ai/status',
        method: 'GET',
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}




