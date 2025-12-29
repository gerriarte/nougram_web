/**
 * Support-related query hooks
 */
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';
import type { Organization, OrganizationListResponse } from '../types/organizations';

export function useGetSupportOrganizations(page: number = 1, pageSize: number = 20, includeInactive: boolean = false) {
  return useQuery({
    queryKey: queryKeys.support.organizations(page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      if (includeInactive) {
        params.append('include_inactive', 'true');
      }
      const response = await apiRequest<OrganizationListResponse>(`/support/organizations?${params.toString()}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useGetSupportOrganization(organizationId: number) {
  return useQuery({
    queryKey: queryKeys.support.organization(organizationId),
    queryFn: async () => {
      const response = await apiRequest<Organization>(`/support/organizations/${organizationId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!organizationId,
  });
}

export function useGetSupportOrganizationUsage(organizationId: number) {
  return useQuery({
    queryKey: queryKeys.support.organizationUsage(organizationId),
    queryFn: async () => {
      const response = await apiRequest(`/support/organizations/${organizationId}/usage`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!organizationId,
  });
}

