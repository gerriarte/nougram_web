/**
 * TanStack Query hooks for API communication
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api-client';
import type { 
  IndustryTemplate, 
  IndustryTemplateListResponse, 
  ApplyTemplateRequest, 
  ApplyTemplateResponse 
} from './types/templates';
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
} from './types/organizations';
import type {
  Subscription,
  CheckoutSessionCreate,
  CheckoutSessionResponse,
  SubscriptionUpdate,
  SubscriptionCancel,
  PlansListResponse,
} from './types/billing';

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
  templates: ['templates'],
  template: (industryType: string) => ['templates', industryType],
  organizations: ['organizations'],
  organization: (id: number) => ['organizations', id],
  subscription: ['billing', 'subscription'],
  plans: ['billing', 'plans'],
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
export function useGetCurrencySettings(includeRates: boolean = false) {
  return useQuery({
    queryKey: ['currency-settings', includeRates],
    queryFn: async () => {
      const url = includeRates 
        ? '/settings/currency?include_rates=true'
        : '/settings/currency';
      const response = await apiRequest(url);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    retry: false,
  });
}

export function useGetExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const response = await apiRequest('/settings/currency/exchange-rates');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    retry: false,
    refetchInterval: 24 * 60 * 60 * 1000, // Refetch every 24 hours (daily rates)
    staleTime: 24 * 60 * 60 * 1000, // Consider data stale after 24 hours
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
  organization_id?: number;
  has_calendar_connected?: boolean;
}

export function useGetCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dfff7b82-9de7-4929-be91-d40c01fc1897',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          sessionId:'debug-session',
          runId:'pre-fix',
          hypothesisId:'H2',
          location:'src/lib/queries.ts:1044',
          message:'useGetCurrentUser query start',
          data:{},
          timestamp:Date.now()
        })
      }).catch(()=>{});
      // #endregion agent log
      const response = await apiRequest<CurrentUser>('/auth/me');
      if (response.error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/dfff7b82-9de7-4929-be91-d40c01fc1897',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            sessionId:'debug-session',
            runId:'pre-fix',
            hypothesisId:'H2',
            location:'src/lib/queries.ts:1046',
            message:'useGetCurrentUser query error',
            data:{ error: response.error },
            timestamp:Date.now()
          })
        }).catch(()=>{});
        // #endregion agent log
        throw new Error(response.error);
      }
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/dfff7b82-9de7-4929-be91-d40c01fc1897',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          sessionId:'debug-session',
          runId:'pre-fix',
          hypothesisId:'H2',
          location:'src/lib/queries.ts:1048',
          message:'useGetCurrentUser query success',
          data:{ userId: response.data?.id ?? null },
          timestamp:Date.now()
        })
      }).catch(()=>{});
      // #endregion agent log
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

/**
 * Templates
 */
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
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.team });
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
    },
  });
}

/**
 * Organizations
 */
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

/**
 * Billing & Subscriptions
 */
export function useGetSubscription() {
  return useQuery<Subscription>({
    queryKey: queryKeys.subscription,
    queryFn: async () => {
      const response = await apiRequest<Subscription>('/billing/subscription');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    retry: false,
  });
}

export function useGetPlans() {
  return useQuery<PlansListResponse>({
    queryKey: queryKeys.plans,
    queryFn: async () => {
      const response = await apiRequest<PlansListResponse>('/billing/plans');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
  });
}

export function useCreateCheckoutSession() {
  return useMutation<CheckoutSessionResponse, Error, CheckoutSessionCreate>({
    mutationFn: async (data) => {
      const response = await apiRequest<CheckoutSessionResponse>(
        '/billing/checkout-session',
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
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation<Subscription, Error, SubscriptionUpdate>({
    mutationFn: async (data) => {
      const response = await apiRequest<Subscription>(
        '/billing/subscription',
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
      queryClient.invalidateQueries({ queryKey: ['organizations', 'me'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation<Subscription, Error, SubscriptionCancel>({
    mutationFn: async (data) => {
      const response = await apiRequest<Subscription>(
        '/billing/subscription/cancel',
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
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
      queryClient.invalidateQueries({ queryKey: ['organizations', 'me'] });
    },
  });
}