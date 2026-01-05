/**
 * Permission utilities for frontend
 * 
 * This file provides utilities to check user permissions based on their role.
 * It mirrors the permission matrix from the backend.
 */

export type UserRole = 
  | 'super_admin'
  | 'support_manager'
  | 'data_analyst'
  | 'owner'
  | 'admin_financiero'
  | 'product_manager'
  | 'collaborator';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role?: string;
  role_type?: 'support' | 'tenant';
  organization_id?: number;
}

// Permission constants (mirroring backend)
export const PERM_VIEW_SENSITIVE_DATA = 'can_view_sensitive_data';
export const PERM_MODIFY_COSTS = 'can_modify_costs';
export const PERM_CREATE_QUOTES = 'can_create_quotes';
export const PERM_SEND_QUOTES = 'can_send_quotes';
export const PERM_MANAGE_SUBSCRIPTION = 'can_manage_subscription';
export const PERM_INVITE_USERS = 'can_invite_users';
export const PERM_CREATE_PROJECTS = 'can_create_projects';
export const PERM_CREATE_SERVICES = 'can_create_services';
export const PERM_DELETE_RESOURCES = 'can_delete_resources';
export const PERM_VIEW_ANALYTICS = 'can_view_analytics';
export const PERM_VIEW_FINANCIAL_PROJECTIONS = 'can_view_financial_projections';

// Permission matrix: role -> set of permissions
const PERMISSION_MATRIX: Record<string, Set<string>> = {
  // Support roles
  super_admin: new Set([
    PERM_VIEW_SENSITIVE_DATA,
    PERM_MODIFY_COSTS,
    PERM_CREATE_QUOTES,
    PERM_SEND_QUOTES,
    PERM_MANAGE_SUBSCRIPTION,
    PERM_INVITE_USERS,
    PERM_CREATE_PROJECTS,
    PERM_CREATE_SERVICES,
    PERM_DELETE_RESOURCES,
    PERM_VIEW_ANALYTICS,
    PERM_VIEW_FINANCIAL_PROJECTIONS,
  ]),
  support_manager: new Set([
    PERM_VIEW_ANALYTICS,
  ]),
  data_analyst: new Set([
    PERM_VIEW_ANALYTICS,
  ]),
  
  // Tenant roles
  owner: new Set([
    PERM_VIEW_SENSITIVE_DATA,
    PERM_MODIFY_COSTS,
    PERM_CREATE_QUOTES,
    PERM_SEND_QUOTES,
    PERM_MANAGE_SUBSCRIPTION,
    PERM_INVITE_USERS,
    PERM_CREATE_PROJECTS,
    PERM_CREATE_SERVICES,
    PERM_DELETE_RESOURCES,
    PERM_VIEW_ANALYTICS,
    PERM_VIEW_FINANCIAL_PROJECTIONS,
  ]),
  admin_financiero: new Set([
    PERM_VIEW_SENSITIVE_DATA,
    PERM_MODIFY_COSTS,
    PERM_CREATE_QUOTES,
    PERM_SEND_QUOTES,
    PERM_CREATE_PROJECTS,
    PERM_CREATE_SERVICES,
    PERM_VIEW_ANALYTICS,
    PERM_VIEW_FINANCIAL_PROJECTIONS,
  ]),
  product_manager: new Set([
    PERM_CREATE_QUOTES,
    PERM_SEND_QUOTES,
    PERM_CREATE_PROJECTS,
    PERM_VIEW_ANALYTICS,
  ]),
  collaborator: new Set([
    PERM_CREATE_QUOTES,
    PERM_CREATE_PROJECTS,
  ]),
};

/**
 * Get user's role from user object
 */
export function getUserRole(user: User | null | undefined): string | null {
  if (!user) return null;
  return user.role || null;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null | undefined, permission: string): boolean {
  if (!user) return false;
  
  const role = getUserRole(user);
  if (!role) return false;
  
  const rolePermissions = PERMISSION_MATRIX[role];
  if (!rolePermissions) return false;
  
  return rolePermissions.has(permission);
}

/**
 * Check if user has one of the specified roles
 */
export function hasRole(user: User | null | undefined, roles: UserRole[]): boolean {
  if (!user) return false;
  const userRole = getUserRole(user);
  return userRole ? roles.includes(userRole as UserRole) : false;
}

/**
 * Check if user can view sensitive data (costs, salaries)
 */
export function canViewSensitiveData(user: User | null | undefined): boolean {
  return hasPermission(user, PERM_VIEW_SENSITIVE_DATA);
}

/**
 * Check if user can modify costs
 */
export function canModifyCosts(user: User | null | undefined): boolean {
  return hasPermission(user, PERM_MODIFY_COSTS);
}

/**
 * Check if user can send quotes
 */
export function canSendQuotes(user: User | null | undefined): boolean {
  return hasPermission(user, PERM_SEND_QUOTES);
}

/**
 * Check if user can manage subscription
 */
export function canManageSubscription(user: User | null | undefined): boolean {
  return hasPermission(user, PERM_MANAGE_SUBSCRIPTION);
}

/**
 * Check if user can invite users
 */
export function canInviteUsers(user: User | null | undefined): boolean {
  return hasPermission(user, PERM_INVITE_USERS);
}

/**
 * Check if user can create services
 */
export function canCreateServices(user: User | null | undefined): boolean {
  return hasPermission(user, PERM_CREATE_SERVICES);
}

/**
 * Check if user can delete resources
 */
export function canDeleteResources(user: User | null | undefined): boolean {
  return hasPermission(user, PERM_DELETE_RESOURCES);
}

/**
 * Check if user consumes credits (product_manager role)
 * Owner and admin_financiero do not consume credits
 */
export function consumesCredits(user: User | null | undefined): boolean {
  const role = getUserRole(user);
  // Only product_manager consumes credits for creating quotes/projects
  return role === 'product_manager';
}

/**
 * Check if user is support role
 */
export function isSupportRole(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role_type === 'support' || hasRole(user, ['super_admin', 'support_manager', 'data_analyst']);
}

/**
 * Check if user is tenant role
 */
export function isTenantRole(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role_type === 'tenant' || hasRole(user, ['owner', 'admin_financiero', 'product_manager', 'collaborator']);
}

/**
 * Check if user can view financial projections
 */
export function canViewFinancialProjections(user: User | null | undefined): boolean {
  return hasPermission(user, PERM_VIEW_FINANCIAL_PROJECTIONS);
}






