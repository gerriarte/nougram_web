/**
 * Organization-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';
import type {
  Organization,
  OrganizationListResponse,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationUser,
  OrganizationUsersListResponse,
  OrganizationInviteRequest,
  OrganizationInviteResponse,
  OrganizationUsageStats,
  AddUserToOrganizationRequest,
  UpdateUserRoleInOrganizationRequest,
  Invitation,
  InvitationListResponse,
  InvitationCreate,
  InvitationAcceptRequest,
  InvitationAcceptResponse,
} from '../types/organizations';

// Re-export types for convenience
export type {
  Organization,
  OrganizationListResponse,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationUser,
  OrganizationUsersListResponse,
  OrganizationInviteRequest,
  OrganizationInviteResponse,
  OrganizationUsageStats,
  AddUserToOrganizationRequest,
  UpdateUserRoleInOrganizationRequest,
  Invitation,
  InvitationListResponse,
  InvitationCreate,
  InvitationAcceptRequest,
  InvitationAcceptResponse,
} from '../types/organizations';

export function useGetOrganizations(
  page: number = 1,
  pageSize: number = 20,
  includeInactive: boolean = false
) {
  return useQuery<OrganizationListResponse>({
    queryKey: [...queryKeys.organizations, page, pageSize, includeInactive],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        include_inactive: includeInactive.toString(),
      });
      const response = await apiRequest<OrganizationListResponse>(
        `/organizations/?${params.toString()}`
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useGetOrganization(orgId: number) {
  return useQuery<Organization>({
    queryKey: queryKeys.organization(orgId),
    queryFn: async () => {
      const response = await apiRequest<Organization>(`/organizations/${orgId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!orgId,
  });
}

export function useGetMyOrganization() {
  return useQuery<Organization>({
    queryKey: ['organizations', 'me'],
    queryFn: async () => {
      const response = await apiRequest<Organization>(`/organizations/me`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation<Organization, Error, OrganizationCreate>({
    mutationFn: async (data) => {
      const response = await apiRequest<Organization>('/organizations/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation<Organization, Error, { orgId: number; data: OrganizationUpdate }>({
    mutationFn: async ({ orgId, data }) => {
      const response = await apiRequest<Organization>(`/organizations/${orgId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(data.id) });
      queryClient.invalidateQueries({ queryKey: ['organizations', 'me'] });
    },
  });
}

export function useGetOrganizationUsers(orgId: number) {
  return useQuery<OrganizationUsersListResponse>({
    queryKey: ['organizations', orgId, 'users'],
    queryFn: async () => {
      const response = await apiRequest<OrganizationUsersListResponse>(
        `/organizations/${orgId}/users`
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!orgId,
  });
}

export function useInviteUserToOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation<
    OrganizationInviteResponse,
    Error,
    { orgId: number; data: OrganizationInviteRequest }
  >({
    mutationFn: async ({ orgId, data }) => {
      const response = await apiRequest<OrganizationInviteResponse>(
        `/organizations/${orgId}/invite`,
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
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.orgId, 'users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useAddUserToOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation<
    OrganizationUser,
    Error,
    { orgId: number; data: AddUserToOrganizationRequest }
  >({
    mutationFn: async ({ orgId, data }) => {
      const response = await apiRequest<OrganizationUser>(
        `/organizations/${orgId}/users`,
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
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.orgId, 'users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useGetInvitations(orgId: number, status?: string) {
  return useQuery({
    queryKey: ['invitations', orgId, status],
    queryFn: async () => {
      const url = status 
        ? `/organizations/${orgId}/invitations?status=${status}`
        : `/organizations/${orgId}/invitations`;
      const response = await apiRequest<InvitationListResponse>(url);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!orgId,
    retry: false,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation<
    Invitation,
    Error,
    { orgId: number; data: InvitationCreate }
  >({
    mutationFn: async ({ orgId, data }) => {
      const response = await apiRequest<Invitation>(
        `/organizations/${orgId}/invitations`,
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
      queryClient.invalidateQueries({ queryKey: ['invitations', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.orgId, 'users'] });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation<
    void,
    Error,
    { orgId: number; invitationId: number }
  >({
    mutationFn: async ({ orgId, invitationId }) => {
      const response = await apiRequest(
        `/organizations/${orgId}/invitations/${invitationId}`,
        {
          method: 'DELETE',
        }
      );
      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', variables.orgId] });
    },
  });
}

export function useAcceptInvitation() {
  return useMutation<
    InvitationAcceptResponse,
    Error,
    { orgId: number; token: string; data?: InvitationAcceptRequest }
  >({
    mutationFn: async ({ orgId, token, data }) => {
      const response = await apiRequest<InvitationAcceptResponse>(
        `/organizations/${orgId}/invitations/${token}/accept`,
        {
          method: 'POST',
          body: JSON.stringify({ token, ...data }),
        }
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useUpdateUserRoleInOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation<
    OrganizationUser,
    Error,
    { orgId: number; userId: number; data: UpdateUserRoleInOrganizationRequest }
  >({
    mutationFn: async ({ orgId, userId, data }) => {
      const response = await apiRequest<OrganizationUser>(
        `/organizations/${orgId}/users/${userId}/role`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.orgId, 'users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useRemoveUserFromOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { orgId: number; userId: number }>({
    mutationFn: async ({ orgId, userId }) => {
      const response = await apiRequest(`/organizations/${orgId}/users/${userId}`, {
        method: 'DELETE',
      });
      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations', variables.orgId, 'users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useGetOrganizationStats(orgId: number) {
  return useQuery<OrganizationUsageStats>({
    queryKey: ['organizations', orgId, 'stats'],
    queryFn: async () => {
      const response = await apiRequest<OrganizationUsageStats>(
        `/organizations/${orgId}/stats`
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!orgId,
  });
}

export function useUpdateOrganizationSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation<
    Organization,
    Error,
    { orgId: number; subscriptionPlan: string }
  >({
    mutationFn: async ({ orgId, subscriptionPlan }) => {
      const response = await apiRequest<Organization>(
        `/organizations/${orgId}/subscription`,
        {
          method: 'PUT',
          body: JSON.stringify({ subscription_plan: subscriptionPlan }),
        }
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
      queryClient.invalidateQueries({ queryKey: queryKeys.organization(data.id) });
      queryClient.invalidateQueries({ queryKey: ['organizations', 'me'] });
    },
  });
}

