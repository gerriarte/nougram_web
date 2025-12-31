/**
 * Billing and subscription types
 */

export interface Subscription {
  id: number;
  organization_id: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  latest_invoice_id: string | null;
  default_payment_method: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CheckoutSessionCreate {
  plan: string;
  interval: 'month' | 'year';
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface SubscriptionUpdate {
  plan?: string;
  interval?: 'month' | 'year';
  cancel_at_period_end?: boolean;
}

export interface SubscriptionCancel {
  cancel_immediately: boolean;
}

export interface PlanInfo {
  name: string;
  display_name: string;
  description: string;
  monthly_price: number | null;
  yearly_price: number | null;
  features: string[];
  limits: {
    max_users?: number;
    max_projects?: number;
    max_services?: number;
    max_team_members?: number;
  };
}

export interface PlansListResponse {
  plans: PlanInfo[];
}

