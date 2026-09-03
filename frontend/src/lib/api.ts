// API base URL.
// - In development: Vite proxies /api to http://localhost:4000 (see vite.config.ts),
//   so the default '/api' is correct and needs no config.
// - In production: point VITE_API_URL at your backend origin (e.g. https://api.yourdomain.com/api)
//   if the frontend is served separately. If the backend serves the built frontend (same origin),
//   the default '/api' works with no config.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

const TOKEN_KEY = 'sheshield_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ReqOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, opts: ReqOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Please check your connection.', 0);
  }

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = json?.error || json?.message || 'Request failed';
    throw new ApiError(msg, res.status);
  }
  return json as T;
}

export const api = {
  // Config
  getConfig: () => request<AppConfigLike>('/config'),
  // Auth
  register: (data: unknown) => request<{ token: string; user: unknown }>('/auth/register', { method: 'POST', body: data }),
  login: (data: unknown) => request<{ token: string; user: unknown }>('/auth/login', { method: 'POST', body: data }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST', auth: true }),
  me: () => request<{ user: unknown }>('/auth/me', { auth: true }),
  forgotPassword: (email: string) => request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (data: unknown) => request<{ message: string }>('/auth/reset-password', { method: 'POST', body: data }),
  changePassword: (data: unknown) => request<{ message: string }>('/auth/change-password', { method: 'PATCH', body: data, auth: true }),

  // Users
  updateMe: (data: unknown) => request<{ user: unknown }>('/users/me', { method: 'PATCH', body: data, auth: true }),
  deleteMe: () => request<{ success: boolean }>('/users/me', { method: 'DELETE', auth: true }),

  // Emergency contacts
  getContacts: () => request<{ contacts: unknown[] }>('/emergency-contacts', { auth: true }),
  createContact: (data: unknown) => request<{ contact: unknown }>('/emergency-contacts', { method: 'POST', body: data, auth: true }),
  updateContact: (id: string, data: unknown) => request<{ contact: unknown }>(`/emergency-contacts/${id}`, { method: 'PATCH', body: data, auth: true }),
  deleteContact: (id: string) => request<{ success: boolean }>(`/emergency-contacts/${id}`, { method: 'DELETE', auth: true }),

  // Alerts / SOS
  getAlerts: () => request<{ alerts: unknown[] }>('/alerts', { auth: true }),
  getActiveAlert: () => request<{ alert: unknown | null }>('/alerts/active', { auth: true }),
  createAlert: (data: unknown) => request<{ alert: unknown }>('/alerts', { method: 'POST', body: data, auth: true }),
  resolveAlert: (id: string, status: string) => request<{ alert: unknown }>(`/alerts/${id}`, { method: 'PATCH', body: { status }, auth: true }),

  // Reports
  getReports: () => request<{ reports: unknown[] }>('/reports', { auth: true }),
  createReport: (data: unknown) => request<{ report: unknown }>('/reports', { method: 'POST', body: data, auth: true }),

  // Admin
  adminStats: () => request<{ stats: unknown }>('/admin/stats', { auth: true }),
  adminUsers: () => request<{ users: unknown[] }>('/admin/users', { auth: true }),
  adminReports: () => request<{ reports: unknown[] }>('/admin/reports', { auth: true }),
  adminAlerts: () => request<{ alerts: unknown[] }>('/admin/alerts', { auth: true }),
  adminUpdateUser: (id: string, data: unknown) => request<{ user: unknown }>(`/admin/users/${id}`, { method: 'PATCH', body: data, auth: true }),
  adminUpdateReport: (id: string, data: unknown) => request<{ report: unknown }>(`/admin/reports/${id}`, { method: 'PATCH', body: data, auth: true }),
};

export type AppConfigLike = import('./types').AppConfig;
