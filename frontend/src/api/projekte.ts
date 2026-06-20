import { apiFetch, adminFetch } from './client';
import type { Projekt } from '../types/instrument';

export interface ProjektAdmin extends Projekt {
  steckbrief_id: string | null;
  start: string | null;
  ende: string | null;
  created_at: string;
}

export interface ProjektCreateBody {
  name: string;
  traeger?: string;
  start?: string;
  ende?: string;
}

export interface ProjektPatchBody {
  name?: string;
  aktiv?: boolean;
  traeger?: string;
  start?: string;
  ende?: string;
}

/** Public: only aktive=true, for meta_projekt */
export function fetchAktiveProjekte(): Promise<Projekt[]> {
  return apiFetch<Projekt[]>('/projekte');
}

/** Admin: all projects with all fields */
export function fetchAllProjekte(): Promise<ProjektAdmin[]> {
  return adminFetch<ProjektAdmin[]>('/admin/projekte');
}

export function createProjekt(body: ProjektCreateBody): Promise<ProjektAdmin> {
  return adminFetch<ProjektAdmin>('/admin/projekte', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function patchProjekt(id: string, body: ProjektPatchBody): Promise<ProjektAdmin> {
  return adminFetch<ProjektAdmin>(`/admin/projekte/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteProjekt(id: string): Promise<{ ok: boolean }> {
  return adminFetch<{ ok: boolean }>(`/admin/projekte/${id}`, { method: 'DELETE' });
}

export function adminLogin(password: string): Promise<{ token: string }> {
  return apiFetch<{ token: string }>('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}
