/**
 * TypeScript types for Organization management
 */

export interface Organization {
  id: number;
  name: string;
  slug: string;
  subscription_plan: 'free' | 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  settings?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  user_count?: number;
}

export interface OrganizationListResponse {
  items: Organization[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OrganizationCreate {
  name: string;
  slug?: string;
  subscription_plan?: 'free' | 'starter' | 'professional' | 'enterprise';
  subscription_status?: 'active' | 'cancelled' | 'past_due' | 'trialing';
  settings?: Record<string, any>;
}

export interface OrganizationUpdate {
  name?: string;
  slug?: string;
  subscription_plan?: 'free' | 'starter' | 'professional' | 'enterprise';
  subscription_status?: 'active' | 'cancelled' | 'past_due' | 'trialing';
  settings?: Record<string, any>;
}

export interface OrganizationUser {
  id: number;
  email: string;
  full_name?: string;
  role: string;
  organization_id: number;
  created_at?: string;
}

export interface OrganizationUsersListResponse {
  items: OrganizationUser[];
  total: number;
}

export interface OrganizationInviteRequest {
  email: string;
  role?: 'org_admin' | 'user';
}

export interface OrganizationInviteResponse {
  success: boolean;
  message: string;
  invitation_sent: boolean;
}

export interface OrganizationUsageStats {
  organization_id: number;
  organization_name: string;
  subscription_plan: 'free' | 'starter' | 'professional' | 'enterprise';
  current_usage: {
    users: number;
    projects: number;
    services: number;
    team_members: number;
  };
  limits: {
    users: number; // -1 means unlimited
    projects: number; // -1 means unlimited
    services: number; // -1 means unlimited
    team_members: number; // -1 means unlimited
  };
  usage_percentage: {
    users: number;
    projects: number;
    services: number;
    team_members: number;
  };
}

export interface AddUserToOrganizationRequest {
  email: string;
  full_name?: string;
  role?: 'org_admin' | 'user';
  password?: string;
}

export interface UpdateUserRoleInOrganizationRequest {
  role: 'org_admin' | 'user';
}

export interface OrganizationRegisterRequest {
  organization_name: string;
  organization_slug?: string;
  admin_email: string;
  admin_full_name: string;
  admin_password: string;
  subscription_plan?: 'free' | 'starter' | 'professional' | 'enterprise';
}

export interface OrganizationRegisterResponse {
  organization: Organization;
  user: {
    id: number;
    email: string;
    full_name?: string;
    role: string;
  };
  access_token: string;
  token_type: string;
}

// Invitation types
export interface Invitation {
  id: number;
  organization_id: number;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at?: string | null;
  created_by_id: number;
  created_at: string;
  updated_at?: string | null;
  status: 'pending' | 'accepted' | 'expired';
}

export interface InvitationListResponse {
  items: Invitation[];
  total: number;
}

export interface InvitationCreate {
  email: string;
  role: string;
}

export interface InvitationAcceptRequest {
  token: string;
  password?: string;
  full_name?: string;
}

export interface InvitationAcceptResponse {
  success: boolean;
  message: string;
  access_token?: string;
  user_id?: number;
  organization_id?: number;
}


