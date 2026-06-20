const BASE = '/api';

export function getAdminToken(): string {
  return sessionStorage.getItem('adminToken') ?? '';
}

export function setAdminToken(token: string) {
  sessionStorage.setItem('adminToken', token);
}

export function clearAdminToken() {
  sessionStorage.removeItem('adminToken');
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  return handleResponse<T>(res);
}

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
      Authorization: `Bearer ${getAdminToken()}`,
    },
  });
  return handleResponse<T>(res);
}
