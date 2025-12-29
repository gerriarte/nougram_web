/**
 * Sales projection-related query hooks
 */
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import type { SalesProjectionRequest, SalesProjectionResponse } from '../types/sales-projection';

export function useCalculateSalesProjection() {
  return useMutation<SalesProjectionResponse, Error, SalesProjectionRequest>({
    mutationFn: async (data: SalesProjectionRequest) => {
      const response = await apiRequest<SalesProjectionResponse>('/sales/projection', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

