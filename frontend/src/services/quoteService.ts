import { apiGet, apiPost, apiPut, apiPatch, getToken, ApiError } from '@/lib/api-client';
import { Quote } from '@/components/dashboard/QuoteCard';
import { QuoteBuilderState, CalculationSummary } from '@/types/quote-builder';

function mapBackendToQuote(row: {
  id: number;
  project: string;
  client: string;
  amount: number;
  currency: string;
  margin: number;
  status: string;
  version: number;
  sentAt?: string | null;
  viewedCount?: number;
  publicToken?: string | null;
}): Quote {
  const statusMap: Record<string, Quote['status']> = {
    draft: 'draft',
    sent: 'sent',
    viewed: 'viewed',
    won: 'accepted',
    lost: 'rejected',
    accepted: 'accepted',
    rejected: 'rejected',
    expired: 'expired',
  };
  return {
    id: String(row.id),
    project: row.project || '',
    client: row.client || '',
    amount: row.amount ?? 0,
    currency: row.currency || 'COP',
    margin: row.margin ?? 0,
    version: row.version ?? 1,
    status: statusMap[row.status?.toLowerCase()] || 'draft',
    sentAt: row.sentAt || undefined,
    viewedCount: row.viewedCount ?? 0,
    downloadCount: 0,
    publicToken: row.publicToken || undefined,
  };
}

export const quoteService = {
  getAll: async (): Promise<Quote[]> => {
    if (!getToken()) return [];
    try {
      const res = await apiGet<{ data: unknown[]; meta?: { total: number } }>('/quotes/?limit=100');
      const items = Array.isArray(res?.data) ? res.data : [];
      return items.map((r: Record<string, unknown>) => mapBackendToQuote(r as Parameters<typeof mapBackendToQuote>[0]));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return [];
      console.error('quoteService.getAll', e);
      return [];
    }
  },

  getById: async (id: string): Promise<Quote | null> => {
    if (!getToken()) return null;
    try {
      const res = await apiGet<Record<string, unknown>>(`/quotes/${id}`);
      if (res) return mapBackendToQuote(res as Parameters<typeof mapBackendToQuote>[0]);
      return null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      console.error('quoteService.getById', e);
      return null;
    }
  },

  create: async (data: Partial<QuoteBuilderState> & { amount: number; marginPercentage: number }): Promise<string> => {
    if (!getToken()) throw new Error('Inicia sesión para crear cotizaciones');
    const items = data.items || [];
    try {
      const res = await apiPost<{ id?: number; project_id?: number }>('/projects/', {
        name: data.projectName || 'Untitled',
        client_name: data.clientName || 'Unknown',
        client_email: data.clientEmail,
        client_company: data.clientCompany,
        currency: data.currency || 'COP',
        tax_ids: data.selectedTaxIds || [],
        quote_items: items.map((item) => ({
          service_id: item.serviceId,
          pricing_type: item.pricingType || 'hourly',
          quantity: item.quantity ?? 1,
          estimated_hours: item.estimatedHours ?? item.allocations?.reduce((s, a) => s + a.hours, 0) ?? 10,
          fixed_price: item.fixedPrice,
          project_value: item.projectValue,
          recurring_price: item.recurringPrice,
          duration_months: item.durationMonths,
        })),
        target_margin: (data.targetMargin ?? 0.35) * 100,
      });
      return String(res?.id ?? res?.project_id ?? crypto.randomUUID());
    } catch (e) {
      console.error('quoteService.create', e);
      throw e;
    }
  },

  update: async (id: string, data: Partial<QuoteBuilderState> & { amount?: number; marginPercentage?: number }): Promise<void> => {
    if (!getToken()) throw new Error('Inicia sesión para editar');
    try {
      await apiPut(`/projects/${id}/quotes/${id}`, data);
    } catch (e) {
      console.error('quoteService.update', e);
      throw e;
    }
  },

  createVersion: async (id: string, data: Partial<QuoteBuilderState> & { amount: number; marginPercentage: number }): Promise<void> => {
    if (!getToken()) throw new Error('Inicia sesión para crear versiones');
    try {
      await apiPost(`/projects/${id}/quotes/${id}/new-version`, data);
    } catch (e) {
      console.error('quoteService.createVersion', e);
      throw e;
    }
  },

  updateStatus: async (id: string, newStatus: Quote['status']): Promise<void> => {
    if (!getToken()) throw new Error('Inicia sesión para actualizar estado');
    try {
      await apiPatch(`/quotes/${id}/status`, { status: newStatus });
    } catch (e) {
      console.error('quoteService.updateStatus', e);
      throw e;
    }
  },

  calculate: async (items: unknown[], taxes: unknown[]): Promise<CalculationSummary> => ({} as CalculationSummary),

  sendEmail: async (id: string, data: unknown): Promise<void> => {
    if (!getToken()) throw new Error('Inicia sesión para enviar');
    try {
      await apiPost(`/projects/${id}/quotes/${id}/send-email`, data);
    } catch (e) {
      console.error('quoteService.sendEmail', e);
      throw e;
    }
  },

  generatePublicLink: async (id: string, daysValid = 30): Promise<string> => {
    if (!getToken()) throw new Error('Inicia sesión para generar enlace');
    try {
      const res = await apiPost<{ token?: string; public_token?: string }>(`/projects/${id}/quotes/${id}/public-link`, { days_valid: daysValid });
      return res?.token ?? res?.public_token ?? '';
    } catch (e) {
      console.error('quoteService.generatePublicLink', e);
      throw e;
    }
  },

  getQuoteByToken: async (token: string): Promise<Quote | null> => {
    try {
      const res = await apiGet<Record<string, unknown>>(`/quotes/public/${token}`, { skipAuth: true });
      if (res) return mapBackendToQuote(res as Parameters<typeof mapBackendToQuote>[0]);
    } catch (e) {
      console.error('quoteService.getQuoteByToken', e);
    }
    return null;
  },

  acceptQuote: async (token: string): Promise<boolean> => {
    try {
      await apiPost(`/quotes/public/${token}/accept`, {}, { skipAuth: true });
      return true;
    } catch (e) {
      console.error('quoteService.acceptQuote', e);
      return false;
    }
  },

  rejectQuote: async (token: string, reason?: string): Promise<boolean> => {
    try {
      await apiPost(`/quotes/public/${token}/reject`, { reason }, { skipAuth: true });
      return true;
    } catch (e) {
      console.error('quoteService.rejectQuote', e);
      return false;
    }
  },
};
