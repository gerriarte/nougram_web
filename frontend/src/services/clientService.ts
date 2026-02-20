import { apiGet, getToken, ApiError } from '@/lib/api-client';

export interface Client {
  id: string;
  name: string;
  email?: string;
  sector?: string;
  projectCount: number;
}

export const clientService = {
  searchClients: async (query: string): Promise<Client[]> => {
    if (!query.trim() || query.length < 2) return [];
    if (!getToken()) return [];
    try {
      const res = await apiGet<{ clients: Array<{ name: string; email?: string; project_count: number }>; total: number }>(
        `/projects/clients/search?q=${encodeURIComponent(query)}&limit=10`
      );
      const clients = res?.clients ?? [];
      return clients.map((c, i) => ({
        id: `api-${c.name}-${i}`,
        name: c.name,
        email: c.email,
        projectCount: c.project_count ?? 0,
      }));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return [];
      console.error('clientService.searchClients', e);
      return [];
    }
  },
};
