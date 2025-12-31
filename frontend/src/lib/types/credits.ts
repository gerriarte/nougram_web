/**
 * TypeScript types for Credit management
 */

export interface CreditBalance {
  organization_id: number;
  credits_available: number;
  credits_used_total: number;
  credits_used_this_month: number;
  credits_per_month: number | null; // null means unlimited
  manual_credits_bonus: number;
  last_reset_at: string | null; // ISO datetime string
  next_reset_at: string | null; // ISO datetime string
  is_unlimited: boolean;
}

export interface CreditTransaction {
  id: number;
  organization_id: number;
  transaction_type: 'subscription_grant' | 'manual_adjustment' | 'consumption' | 'refund';
  amount: number; // Positive = added, negative = consumed
  reason: string | null;
  reference_id: number | null;
  performed_by: number | null;
  created_at: string; // ISO datetime string
}

export interface CreditTransactionListResponse {
  items: CreditTransaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GrantManualCreditsRequest {
  amount: number;
  reason: string;
}

export interface ResetCreditsRequest {
  // Empty request body
}




