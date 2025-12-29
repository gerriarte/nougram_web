/**
 * Type definitions for Industry Templates
 */

export interface IndustryTemplate {
  id: number;
  industry_type: string;
  name: string;
  description: string | null;
  suggested_roles: SuggestedRole[] | null;
  suggested_services: SuggestedService[] | null;
  suggested_fixed_costs: SuggestedCost[] | null;
  is_active: boolean;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface SuggestedRole {
  name: string;
  monthly_cost: number;
  weekly_hours: number;
  seniority?: string;
}

export interface SuggestedService {
  name: string;
  default_hourly_rate: number | null;
  category: string;
  description?: string | null;
}

export interface SuggestedCost {
  name: string;
  amount: number;
  category: string;
  description?: string | null;
  adjust_by_region?: boolean;
}

export interface IndustryTemplateListResponse {
  items: IndustryTemplate[];
  total: number;
}

export interface ApplyTemplateRequest {
  industry_type: string;
  region?: string;
  currency?: string;
  customize?: {
    roles?: Array<{
      name: string;
      monthly_cost?: number;
      weekly_hours?: number;
    }>;
    services?: Array<{
      name: string;
      default_hourly_rate?: number;
      category?: string;
    }>;
    costs?: Array<{
      name: string;
      amount?: number;
      category?: string;
    }>;
    client_types?: string[];
    services_offered?: string[];
    team_size_range?: string;
  };
}

export interface ApplyTemplateResponse {
  success: boolean;
  message: string;
  template_applied: string;
  region: string;
  multiplier: number;
  currency: string;
  team_members_created: number;
  services_created: number;
  costs_created: number;
  created_items: Array<{
    type: string;
    name: string;
    [key: string]: unknown;
  }>;
}

// Frontend-friendly format (for UI components)
export interface TemplateCardData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  suggestedRoles: SuggestedRole[];
  suggestedServices: SuggestedService[];
  suggestedCompanyCosts: SuggestedCost[];
}










