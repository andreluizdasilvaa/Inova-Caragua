/**
 * API Client — Centralized fetch functions for all entities.
 * Replaces direct mockData usage across the app.
 */

const BASE_URL = '/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Occurrences ──────────────────────────────────────────────────────────────

export interface OccurrencePayload {
  titulo: string;
  descricao: string;
  tipoSolicitacao: string;
  localizacaoDescricao?: string | null;
  numeroPatrimonioTexto?: string | null;
  itemId?: string | null;
  instituicaoId: string;
  criadoPorId: string;
  prioridade?: string | null;
}

export const api = {
  // ── Occurrences ──
  occurrences: {
    list: (params?: { instituicaoId?: string; status?: string; page?: number; limit?: number }): Promise<any[]> => {
      const sp = new URLSearchParams();
      if (params?.instituicaoId) sp.set('instituicaoId', params.instituicaoId);
      if (params?.status) sp.set('status', params.status);
      if (params?.page) sp.set('page', String(params.page));
      if (params?.limit) sp.set('limit', String(params.limit));
      const qs = sp.toString();
      return request<any>(`${BASE_URL}/ocorrencias${qs ? `?${qs}` : ''}`).then((res: any) => {
        // API now returns { data, total, page, limit, totalPages } or array
        if (Array.isArray(res)) return res;
        if (res && res.data) return res.data;
        return [];
      });
    },

    get: (id: string) => request<any>(`${BASE_URL}/ocorrencias?id=${id}`),

    create: (data: OccurrencePayload) =>
      request<any>(`${BASE_URL}/ocorrencias`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      request<any>(`${BASE_URL}/ocorrencias`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      }),

    delete: (id: string) =>
      request<any>(`${BASE_URL}/ocorrencias`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      }),
  },

  // ── Items / Assets ──
  items: {
    list: (params?: { instituicaoId?: string; categoria?: string; page?: number; limit?: number }): Promise<any[]> => {
      const sp = new URLSearchParams();
      if (params?.instituicaoId) sp.set('instituicaoId', params.instituicaoId);
      if (params?.categoria) sp.set('categoria', params.categoria);
      if (params?.page) sp.set('page', String(params.page));
      if (params?.limit) sp.set('limit', String(params.limit));
      const qs = sp.toString();
      return request<any>(`${BASE_URL}/itens${qs ? `?${qs}` : ''}`).then((res: any) => {
        if (Array.isArray(res)) return res;
        if (res && res.data) return res.data;
        return [];
      });
    },

    get: (id: string) => request<any>(`${BASE_URL}/itens?id=${id}`),

    create: (data: any) =>
      request<any>(`${BASE_URL}/itens`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      request<any>(`${BASE_URL}/itens`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
      }),

    delete: (id: string) =>
      request<any>(`${BASE_URL}/itens`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      }),

    createBatch: (items: any[], instituicaoId: string, cadastradoPorId?: string) =>
      request<{ created: number; errors: { index: number; message: string }[] }>(
        `${BASE_URL}/itens/batch`,
        {
          method: 'POST',
          body: JSON.stringify({ items, instituicaoId, cadastradoPorId }),
        }
      ),
  },

  // ── Institutions ──
  instituicoes: {
    list: () => request<any[]>(`${BASE_URL}/instituicoes`),
    get: (id: string) => request<any>(`${BASE_URL}/instituicoes?id=${id}`),
  },

  // ── Sectors ──
  setores: {
    list: (instituicaoId: string) =>
      request<any[]>(`${BASE_URL}/setores?instituicaoId=${instituicaoId}`),
  },

  // ── History ──
  history: {
    list: (itemId: string) =>
      request<any[]>(`${BASE_URL}/historico?itemId=${itemId}`),
    create: (data: any) =>
      request<any>(`${BASE_URL}/historico`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ── Stats ──
  stats: {
    dashboard: (params?: { instituicaoId?: string }) => {
      const sp = new URLSearchParams();
      if (params?.instituicaoId) sp.set('instituicaoId', params.instituicaoId);
      const qs = sp.toString();
      return request<any>(`${BASE_URL}/stats${qs ? `?${qs}` : ''}`);
    },
  },
};