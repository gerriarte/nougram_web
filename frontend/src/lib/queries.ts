/**
 * TanStack Query hooks for API communication
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api-client';

// API Base URL (without /api/v1 prefix as apiRequest already includes it)
const API_BASE = '';

/**
 * Query Keys
 */
export const queryKeys = {
  services: ['services'],
  team: ['team'],
  fixedCosts: ['fixed-costs'],
  projects: ['projects'],
  dashboard: ['dashboard'],
  taxes: ['taxes'],
  deleteRequests: ['delete-requests'],
  users: ['users'],
  currentUser: ['auth', 'me'],
};

/**
 * Services
 */
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

/**
 * Team Members
 */
export function useGetTeamMembers() {
  return useQuery({
    queryKey: queryKeys.team,
    queryFn: async () => {
      const response = await apiRequest('/settings/team');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    retry: false,
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: unknown) => {
      return await apiRequest('/settings/team', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team });
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: unknown }) => {
      const response = await apiRequest(`/settings/team/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team });
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/settings/team/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team });
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
    },
  });
}

/**
 * Fixed Costs
 */
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
      queryClient.invalidateQueries({ queryKey: [...queryKeys.fixedCosts, 'trash'] });
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
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
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
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
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
    },
  });
}

/**
 * Blended Cost Rate
 */
export function useGetBlendedCostRate() {
  return useQuery({
    queryKey: ['blended-cost-rate'],
    queryFn: async () => {
      const response = await apiRequest('/settings/calculations/agency-cost-hour');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    retry: false,
  });
}

/**
 * Dashboard
 */
export function useGetDashboardData(
  startDate?: string, 
  endDate?: string,
  currency?: string,
  status?: string,
  clientName?: string,
  comparePrevious?: boolean
) {
  return useQuery({
    queryKey: [...queryKeys.dashboard, startDate, endDate, currency, status, clientName, comparePrevious],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (currency) params.append('currency', currency);
      if (status) params.append('status', status);
      if (clientName) params.append('client_name', clientName);
      if (comparePrevious) params.append('compare_previous', 'true');
      const url = `/insights/dashboard${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiRequest(url);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

/**
 * Currency Settings
 */
export function useGetCurrencySettings() {
  return useQuery({
    queryKey: ['currency-settings'],
    queryFn: async () => {
      const response = await apiRequest('/settings/currency');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    retry: false,
  });
}

export function useUpdateCurrencySettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { primary_currency: string }) => {
      return await apiRequest('/settings/currency', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency-settings'] });
      queryClient.invalidateQueries({ queryKey: ['blended-cost-rate'] });
    },
  });
}

/**
 * Quote Calculation
 */
export function useCalculateQuote() {
  return useMutation({
    mutationFn: async (data: { items: Array<{ service_id: number; estimated_hours: number }>; tax_ids?: number[] }) => {
      const response = await apiRequest('/quotes/calculate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

/**
 * Projects CRUD
 */
export function useGetProjects(status_filter?: string) {
  return useQuery({
    queryKey: [...queryKeys.projects, status_filter],
    queryFn: async () => {
      const url = status_filter ? `/projects/?status_filter=${status_filter}` : '/projects/';
      const response = await apiRequest(url);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    retry: false,
  });
}

export function useGetProject(projectId: number) {
  return useQuery({
    queryKey: [...queryKeys.projects, projectId],
    queryFn: async () => {
      const response = await apiRequest(`/projects/${projectId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await apiRequest('/projects/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: unknown }) => {
      const response = await apiRequest(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/projects/${id}`, {
        method: 'DELETE',
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.projects, 'trash'] });
    },
  });
}

export function useGetDeletedProjects() {
  return useQuery({
    queryKey: [...queryKeys.projects, 'trash'],
    queryFn: async () => {
      const response = await apiRequest('/projects/trash/list');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

export function useRestoreProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/projects/${id}/restore`, {
        method: 'POST',
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.projects, 'trash'] });
    },
  });
}

export function usePermanentlyDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/projects/${id}/permanent`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.projects, 'trash'] });
    },
  });
}

/**
 * Quotes
 */
export function useGetProjectQuotes(projectId: number) {
  return useQuery({
    queryKey: ['quotes', projectId],
    queryFn: async () => {
      const response = await apiRequest(`/projects/${projectId}/quotes`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useGetQuote(projectId: number, quoteId: number) {
  return useQuery({
    queryKey: ['quote', projectId, quoteId],
    queryFn: async () => {
      const response = await apiRequest(`/projects/${projectId}/quotes/${quoteId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!projectId && !!quoteId,
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, quoteId, data }: { projectId: number; quoteId: number; data: unknown }) => {
      const response = await apiRequest(`/projects/${projectId}/quotes/${quoteId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quote', variables.projectId, variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: ['quotes', variables.projectId] });
    },
  });
}

export function useCreateQuoteVersion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, quoteId, data }: { projectId: number; quoteId: number; data: unknown }) => {
      const response = await apiRequest(`/projects/${projectId}/quotes/${quoteId}/new-version`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: ['quotes', variables.projectId] });
    },
  });
}

export function useSendQuoteEmail() {
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      quoteId, 
      emailData 
    }: { 
      projectId: number
      quoteId: number
      emailData: {
        to_email: string
        subject?: string
        message?: string
        cc?: string[]
        bcc?: string[]
        include_pdf?: boolean
        include_docx?: boolean
      }
    }) => {
      const response = await apiRequest(`/projects/${projectId}/quotes/${quoteId}/send-email`, {
        method: 'POST',
        body: JSON.stringify(emailData),
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

/**
 * Taxes
 */
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

/**
 * Delete Requests
 */
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
      // Invalidate relevant resource queries
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

/**
 * Users
 */
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

/**
 * Get pending delete requests count
 */
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

/**
 * Get current user from auth endpoint
 */
export interface CurrentUser {
  id: number;
  email: string;
  full_name: string;
  role?: 'super_admin' | 'admin_financiero' | 'product_manager';
  has_calendar_connected?: boolean;
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { full_name: string }) => {
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
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

