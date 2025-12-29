/**
 * Billing and subscription-related query hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api-client';
import { queryKeys } from './queryKeys';
import type {
  Subscription,
  CheckoutSessionCreate,
  CheckoutSessionResponse,
  SubscriptionUpdate,
  SubscriptionCancel,
  PlansListResponse,
} from '../types/billing';

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

