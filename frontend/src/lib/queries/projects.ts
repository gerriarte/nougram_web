/**
 * Project and quote-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';

// Projects CRUD
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

// Quotes
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


export function useGetQuoteRentability(quoteId: number) {
  return useQuery({
    queryKey: ['quote-rentability', quoteId],
    queryFn: async () => {
      const response = await apiRequest(`/quotes/${quoteId}/rentability`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!quoteId,
  });
}
