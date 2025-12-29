/**
 * Template-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';
import type { 
  IndustryTemplate, 
  IndustryTemplateListResponse, 
  ApplyTemplateRequest, 
  ApplyTemplateResponse 
} from '../types/templates';

export function useGetTemplates(activeOnly: boolean = true) {
  return useQuery<IndustryTemplateListResponse>({
    queryKey: [...queryKeys.templates, activeOnly],
    queryFn: async () => {
      const response = await apiRequest<IndustryTemplateListResponse>(
        `/templates/industries?active_only=${activeOnly}`
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useGetTemplate(industryType: string) {
  return useQuery<IndustryTemplate>({
    queryKey: queryKeys.template(industryType),
    queryFn: async () => {
      const response = await apiRequest<IndustryTemplate>(
        `/templates/industries/${industryType}`
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!industryType,
  });
}

export function useApplyTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation<ApplyTemplateResponse, Error, { organizationId: number; data: ApplyTemplateRequest }>({
    mutationFn: async ({ organizationId, data }) => {
      const response = await apiRequest<ApplyTemplateResponse>(
        `/templates/organizations/${organizationId}/apply-template`,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team });
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
    },
  });
}

