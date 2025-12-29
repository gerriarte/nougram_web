/**
 * Quote expense-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';

export interface QuoteExpense {
  id: number;
  quote_id: number;
  name: string;
  description?: string;
  cost: number;
  markup_percentage: number;
  client_price: number;
  category?: string;
  quantity: number;
  created_at?: string;
}

export interface QuoteExpenseCreate {
  name: string;
  description?: string;
  cost: number;
  markup_percentage: number;
  category?: string;
  quantity?: number;
}

export function useGetQuoteExpenses(projectId: number, quoteId: number) {
  return useQuery({
    queryKey: queryKeys.quoteExpenses(projectId, quoteId),
    queryFn: async () => {
      const response = await apiRequest<QuoteExpense[]>(`/projects/${projectId}/quotes/${quoteId}/expenses`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    enabled: !!projectId && !!quoteId,
  });
}

export function useCreateQuoteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, quoteId, data }: { projectId: number; quoteId: number; data: QuoteExpenseCreate }) => {
      const response = await apiRequest<QuoteExpense>(`/projects/${projectId}/quotes/${quoteId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteExpenses(variables.projectId, variables.quoteId) });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.projectId, variables.quoteId] });
    },
  });
}

export function useUpdateQuoteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, quoteId, expenseId, data }: { projectId: number; quoteId: number; expenseId: number; data: QuoteExpenseCreate }) => {
      const response = await apiRequest<QuoteExpense>(`/projects/${projectId}/quotes/${quoteId}/expenses/${expenseId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteExpenses(variables.projectId, variables.quoteId) });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.projectId, variables.quoteId] });
    },
  });
}

export function useDeleteQuoteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, quoteId, expenseId }: { projectId: number; quoteId: number; expenseId: number }) => {
      const response = await apiRequest(`/projects/${projectId}/quotes/${quoteId}/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quoteExpenses(variables.projectId, variables.quoteId) });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.projectId, variables.quoteId] });
    },
  });
}

