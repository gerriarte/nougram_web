/**
 * Reusable CRUD hooks to avoid code duplication
 * Provides consistent error handling and toast notifications
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { MESSAGES } from "@/lib/messages"
import { apiRequest } from "@/lib/api-client"

interface UseCrudOptions<T> {
  endpoint: string
  queryKey: string[]
  successMessage: string
  errorMessage: string
  relatedQueryKeys?: string[]
}

interface UseCreateOptions<T> extends UseCrudOptions<T> {
  onSuccess?: (data: T) => void
}

interface UseUpdateOptions<T> extends UseCrudOptions<T> {
  onSuccess?: (data: T) => void
}

interface UseDeleteOptions extends Omit<UseCrudOptions<unknown>, "successMessage" | "errorMessage"> {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
}

export function useCreate<T>({
  endpoint,
  queryKey,
  successMessage,
  errorMessage,
  relatedQueryKeys = [],
  onSuccess,
}: UseCreateOptions<T>) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: unknown): Promise<T> => {
      const response = await apiRequest<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      })

      if (response.error) {
        throw new Error(response.error)
      }

      if (!response.data) {
        throw new Error(errorMessage)
      }

      return response.data
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey })
      relatedQueryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Show success toast
      toast({
        title: "Success",
        description: successMessage,
        variant: "default",
      })

      onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || errorMessage,
        variant: "destructive",
      })
    },
  })
}

export function useUpdate<T>({
  endpoint,
  queryKey,
  successMessage,
  errorMessage,
  relatedQueryKeys = [],
  onSuccess,
}: UseUpdateOptions<T>) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: unknown }): Promise<T> => {
      const response = await apiRequest<T>(`${endpoint}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })

      if (response.error) {
        throw new Error(response.error)
      }

      if (!response.data) {
        throw new Error(errorMessage)
      }

      return response.data
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey })
      relatedQueryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Show success toast
      toast({
        title: "Success",
        description: successMessage,
        variant: "default",
      })

      onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || errorMessage,
        variant: "destructive",
      })
    },
  })
}

export function useDelete({
  endpoint,
  queryKey,
  successMessage = "Item deleted successfully",
  errorMessage = "Failed to delete item",
  relatedQueryKeys = [],
  onSuccess,
}: UseDeleteOptions) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await apiRequest(`${endpoint}/${id}`, {
        method: "DELETE",
      })

      if (response.error) {
        throw new Error(response.error)
      }
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey })
      relatedQueryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Show success toast
      toast({
        title: "Success",
        description: successMessage,
        variant: "default",
      })

      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || errorMessage,
        variant: "destructive",
      })
    },
  })
}

