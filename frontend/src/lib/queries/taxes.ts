/**
 * Tax-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';

export function useGetTaxes(country?: string, activeOnly?: boolean) {
  return useQuery({
    queryKey: [...queryKeys.taxes, country, activeOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (country) params.append('country', country);
      if (activeOnly) params.append('active_only', 'true');
      const url = `/taxes/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiRequest(url);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

export function useCreateTax() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await apiRequest('/taxes/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxes });
    },
  });
}

export function useUpdateTax() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: unknown }) => {
      const response = await apiRequest(`/taxes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxes });
    },
  });
}

export function useDeleteTax() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/taxes/${id}`, {
        method: 'DELETE',
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxes });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.taxes, 'trash'] });
    },
  });
}

export function useGetDeletedTaxes() {
  return useQuery({
    queryKey: [...queryKeys.taxes, 'trash'],
    queryFn: async () => {
      const response = await apiRequest('/taxes/trash/list');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

export function useRestoreTax() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/taxes/${id}/restore`, {
        method: 'POST',
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxes });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.taxes, 'trash'] });
    },
  });
}

export function usePermanentlyDeleteTax() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/taxes/${id}/permanent`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.taxes, 'trash'] });
    },
  });
}

