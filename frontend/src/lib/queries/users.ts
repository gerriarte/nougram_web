/**
 * User and delete request-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';

// Delete Requests
export interface DeleteRequest {
  id: number;
  resource_type: string;
  resource_id: number;
  requested_by_id: number;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by_id?: number;
  approved_at?: string;
  rejection_reason?: string;
  requested_by_name?: string;
  requested_by_email?: string;
  approved_by_name?: string;
  approved_by_email?: string;
}

export interface DeleteRequestListResponse {
  items: DeleteRequest[];
  total: number;
}

export function useGetDeleteRequests(status?: 'pending' | 'approved' | 'rejected') {
  return useQuery({
    queryKey: [...queryKeys.deleteRequests, status || 'all'],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const response = await apiRequest<DeleteRequestListResponse>(`/delete-requests${params}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useGetDeleteRequest(requestId: number) {
  return useQuery({
    queryKey: [...queryKeys.deleteRequests, requestId],
    queryFn: async () => {
      const response = await apiRequest<DeleteRequest>(`/delete-requests/${requestId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!requestId,
  });
}

export function useApproveDeleteRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: number; reason?: string }) => {
      const response = await apiRequest(`/delete-requests/${requestId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deleteRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.taxes });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useRejectDeleteRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: number; reason?: string }) => {
      const response = await apiRequest(`/delete-requests/${requestId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deleteRequests });
    },
  });
}

export function useGetPendingDeleteRequestsCount() {
  return useQuery({
    queryKey: ['delete-requests', 'pending-count'],
    queryFn: async () => {
      const response = await apiRequest<number>('/delete-requests/pending-count');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Users
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin_financiero' | 'product_manager';
  has_calendar_connected?: boolean;
}

export interface UserListResponse {
  items: User[];
  total: number;
}

export interface CurrentUser {
  id: number;
  email: string;
  full_name: string;
  role?: 'super_admin' | 'support_manager' | 'data_analyst' | 'owner' | 'admin_financiero' | 'product_manager' | 'collaborator';
  organization_id?: number;
  has_calendar_connected?: boolean;
  organization?: {
    id: number;
    name: string;
    settings?: {
      onboarding_completed?: boolean;
      [key: string]: any;
    };
  };
}

export function useGetUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const response = await apiRequest<UserListResponse>('/users/');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, full_name, role, password }: { email: string; full_name: string; role: 'super_admin' | 'admin_financiero' | 'product_manager'; password: string }) => {
      const response = await apiRequest<User>('/users/', {
        method: 'POST',
        body: JSON.stringify({ email, full_name, role, password }),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: 'super_admin' | 'admin_financiero' | 'product_manager' }) => {
      const response = await apiRequest(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useGetCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const response = await apiRequest<CurrentUser>('/auth/me');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useSwitchOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: number) => {
      const response = await apiRequest<{ access_token: string }>('/auth/switch-organization', {
        method: 'POST',
        body: JSON.stringify({ organization_id: organizationId }),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined' && data?.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }
      queryClient.invalidateQueries();
      window.location.reload();
    },
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { full_name?: string; password?: string }) => {
      const response = await apiRequest<CurrentUser>('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

