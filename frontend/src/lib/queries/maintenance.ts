/**
 * Maintenance-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';

export interface TrashStats {
  services: number;
  costs: number;
  taxes: number;
  projects: number;
  total: number;
}

export interface CleanupResponse {
  services_deleted: number;
  costs_deleted: number;
  taxes_deleted: number;
  projects_deleted: number;
  total_deleted: number;
  message: string;
}

/**
 * Hook to get trash statistics
 */
export function useGetTrashStats() {
  return useQuery({
    queryKey: ['maintenance', 'trash-stats'],
    queryFn: async (): Promise<TrashStats> => {
      const response = await apiRequest<TrashStats>('/maintenance/trash-stats');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

/**
 * Hook to cleanup old trash items
 */
export function useCleanupTrash() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (daysOld: number = 30): Promise<CleanupResponse> => {
      const response = await apiRequest<CleanupResponse>(
        `/maintenance/cleanup-trash?days_old=${daysOld}`,
        {
          method: 'POST',
        }
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: () => {
      // Invalidate trash stats after cleanup
      queryClient.invalidateQueries({ queryKey: ['maintenance', 'trash-stats'] });
    },
  });
}
