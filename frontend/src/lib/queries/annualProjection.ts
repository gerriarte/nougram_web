/**
 * React Query hooks for Annual Sales Projections (Sprint 20)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';
import type {
  AnnualSalesProjection,
  AnnualSalesProjectionCreate,
  BulkUpdateEntriesRequest,
  ReplicateMonthRequest,
} from '../types/annual-projection';

/**
 * Hook to get active annual projection
 */
export function useGetActiveAnnualProjection(year?: number) {
  return useQuery({
    queryKey: ['annual-projection', 'active', year],
    queryFn: async (): Promise<AnnualSalesProjection> => {
      const url = year 
        ? `/projections/annual?year=${year}`
        : '/projections/annual';
      const response = await apiRequest<AnnualSalesProjection>(url, {
        method: 'GET',
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    },
    retry: false,
  });
}

/**
 * Hook to get annual projection by year
 */
export function useGetAnnualProjectionByYear(year: number) {
  return useQuery({
    queryKey: ['annual-projection', year],
    queryFn: async (): Promise<AnnualSalesProjection> => {
      const response = await apiRequest<AnnualSalesProjection>(`/projections/annual/${year}`, {
        method: 'GET',
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    },
    enabled: !!year,
    retry: false,
  });
}

/**
 * Hook to create annual projection
 */
export function useCreateAnnualProjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AnnualSalesProjectionCreate): Promise<AnnualSalesProjection> => {
      const response = await apiRequest<AnnualSalesProjection>('/projections/annual', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['annual-projection'] });
      queryClient.setQueryData(['annual-projection', data.year], data);
    },
  });
}

/**
 * Hook to update annual projection
 */
export function useUpdateAnnualProjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectionId,
      data,
    }: {
      projectionId: number;
      data: AnnualSalesProjectionCreate;
    }): Promise<AnnualSalesProjection> => {
      const response = await apiRequest<AnnualSalesProjection>(`/projections/annual/${projectionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['annual-projection'] });
      queryClient.setQueryData(['annual-projection', data.year], data);
    },
  });
}

/**
 * Hook to delete annual projection
 */
export function useDeleteAnnualProjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectionId: number): Promise<void> => {
      const response = await apiRequest(`/projections/annual/${projectionId}`, {
        method: 'DELETE',
      });

      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annual-projection'] });
    },
  });
}

/**
 * Hook to bulk update projection entries
 */
export function useBulkUpdateProjectionEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectionId,
      data,
    }: {
      projectionId: number;
      data: BulkUpdateEntriesRequest;
    }): Promise<{ success: boolean; entries_updated: number; summary: any }> => {
      const response = await apiRequest<{ success: boolean; entries_updated: number; summary: any }>(
        `/projections/annual/${projectionId}/entries/bulk`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annual-projection'] });
    },
  });
}

/**
 * Hook to replicate month values
 */
export function useReplicateMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectionId,
      data,
    }: {
      projectionId: number;
      data: ReplicateMonthRequest;
    }): Promise<{ success: boolean; source_month: number; target_months: number[]; entries_replicated: number }> => {
      const response = await apiRequest<{ success: boolean; source_month: number; target_months: number[]; entries_replicated: number }>(
        `/projections/annual/${projectionId}/replicate-month`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annual-projection'] });
    },
  });
}
