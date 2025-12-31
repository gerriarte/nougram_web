/**
 * Service-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';

export function useGetServices() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: async () => {
      const response = await apiRequest('/services/');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    retry: false,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await apiRequest('/services/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: unknown }) => {
      const response = await apiRequest(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/services/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.services, 'trash'] });
    },
  });
}

export function useGetDeletedServices() {
  return useQuery({
    queryKey: [...queryKeys.services, 'trash'],
    queryFn: async () => {
      const response = await apiRequest('/services/trash/list');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

export function useRestoreService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/services/${id}/restore`, {
        method: 'POST',
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.services, 'trash'] });
    },
  });
}

export function usePermanentlyDeleteService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/services/${id}/permanent`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.services, 'trash'] });
    },
  });
}




