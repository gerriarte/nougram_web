/**
 * Centralized query keys for TanStack Query
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
  credits: {
    balance: ['credits', 'balance'],
    history: (page?: number, pageSize?: number) => ['credits', 'history', page, pageSize],
    adminBalance: (orgId: number) => ['credits', 'admin', 'balance', orgId],
    adminHistory: (orgId: number, page?: number, pageSize?: number) => ['credits', 'admin', 'history', orgId, page, pageSize],
  },
  support: {
    organizations: (page?: number, pageSize?: number) => ['support', 'organizations', page, pageSize],
    organization: (orgId: number) => ['support', 'organizations', orgId],
    organizationUsage: (orgId: number) => ['support', 'organizations', orgId, 'usage'],
  },
  salesProjection: ['sales-projection'],
  quoteExpenses: (projectId: number, quoteId: number) => ['quote-expenses', projectId, quoteId],
  ai: {
    status: () => ['ai', 'status'],
    suggestions: () => ['ai', 'suggestions'],
  },
};

