/**
 * Fixed cost-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';

export function useGetFixedCosts() {
  return useQuery({
    queryKey: queryKeys.fixedCosts,
    queryFn: async () => {
      const response = await apiRequest('/settings/costs/fixed');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    retry: false,
  });
}

export function useCreateFixedCost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: unknown) => {
      return await apiRequest('/settings/costs/fixed', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts });
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
    },
  });
}

export function useUpdateFixedCost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: unknown }) => {
      const response = await apiRequest(`/settings/costs/fixed/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts });
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
    },
  });
}

export function useDeleteFixedCost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/settings/costs/fixed/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts });
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.fixedCosts, 'trash'] });
    },
  });
}

export function useGetDeletedFixedCosts() {
  return useQuery({
    queryKey: [...queryKeys.fixedCosts, 'trash'],
    queryFn: async () => {
      const response = await apiRequest('/settings/costs/fixed/trash/list');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

export function useRestoreFixedCost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/settings/costs/fixed/${id}/restore`, {
        method: 'POST',
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.fixedCosts, 'trash'] });
    },
  });
}

export function usePermanentlyDeleteFixedCost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/settings/costs/fixed/${id}/permanent`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.fixedCosts, 'trash'] });
    },
  });
}
