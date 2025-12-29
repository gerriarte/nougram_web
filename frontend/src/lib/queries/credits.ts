/**
 * Credit-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';
import type { CreditBalance, CreditTransactionListResponse, GrantManualCreditsRequest } from '../types/credits';

export function useGetMyCreditBalance() {
  return useQuery({
    queryKey: queryKeys.credits.balance,
    queryFn: async () => {
      const response = await apiRequest<CreditBalance>('/credits/me/balance');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useGetMyCreditHistory(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: queryKeys.credits.history(page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      const response = await apiRequest<CreditTransactionListResponse>(`/credits/me/history?${params.toString()}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useGetAdminCreditBalance(organizationId: number) {
  return useQuery({
    queryKey: queryKeys.credits.adminBalance(organizationId),
    queryFn: async () => {
      const response = await apiRequest<CreditBalance>(`/credits/admin/${organizationId}/balance`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!organizationId,
  });
}

export function useGetAdminCreditHistory(organizationId: number, page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: queryKeys.credits.adminHistory(organizationId, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      const response = await apiRequest<CreditTransactionListResponse>(`/credits/admin/${organizationId}/transactions?${params.toString()}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!organizationId,
  });
}

export function useGrantManualCredits() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, data }: { organizationId: number; data: GrantManualCreditsRequest }) => {
      const response = await apiRequest<CreditBalance>(`/credits/admin/${organizationId}/grant`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.adminBalance(variables.organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.adminHistory(variables.organizationId) });
    },
  });
}

export function useResetMonthlyCredits() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (organizationId: number) => {
      const response = await apiRequest<CreditBalance>(`/credits/admin/${organizationId}/reset`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (_, organizationId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.adminBalance(organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.adminHistory(organizationId) });
    },
  });
}

