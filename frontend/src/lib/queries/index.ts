/**
 * Central export file for all query hooks
 * This file re-exports all hooks from their respective modules
 */

// Export query keys
export { queryKeys } from './queryKeys';

// Services
export * from './services';

// Team
export * from './team';

// Fixed Costs
export * from './fixedCosts';

// Dashboard, Currency, Calculations
export * from './dashboard';

// Projects & Quotes
export * from './projects';

// Taxes
export * from './taxes';

// Users & Delete Requests
// Using explicit exports to avoid webpack module resolution issues
export type {
  User,
  CurrentUser,
  UserListResponse,
  DeleteRequest,
  DeleteRequestListResponse,
} from './users';

export {
  useGetUsers,
  useCreateUser,
  useUpdateUserRole,
  useGetCurrentUser,
  useSwitchOrganization,
  useUpdateCurrentUser,
  useGetDeleteRequests,
  useGetDeleteRequest,
  useGetPendingDeleteRequestsCount,
  useApproveDeleteRequest,
  useRejectDeleteRequest,
} from './users';

// Templates
export * from './templates';

// Organizations
// Using explicit exports to avoid webpack module resolution issues
export {
  useGetOrganizations,
  useGetOrganization,
  useGetMyOrganization,
  useCreateOrganization,
  useUpdateOrganization,
  useGetOrganizationUsers,
  useInviteUserToOrganization,
  useAddUserToOrganization,
  useGetInvitations,
  useCreateInvitation,
  useCancelInvitation,
  useAcceptInvitation,
  useUpdateUserRoleInOrganization,
  useRemoveUserFromOrganization,
  useGetOrganizationStats,
  useUpdateOrganizationSubscription,
} from './organizations';

export type {
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
  Invitation,
  InvitationListResponse,
  InvitationCreate,
  InvitationAcceptRequest,
  InvitationAcceptResponse,
} from './organizations';

// Billing
export * from './billing';

// Credits
export * from './credits';

// Support
export * from './support';

// Expenses
export * from './expenses';

// Sales Projection
export * from './salesProjection';

// AI
export * from './ai';
