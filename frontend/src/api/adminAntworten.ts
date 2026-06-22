import { adminFetch } from './client';

export interface AntwortenMeta {
  id: string;
  projekt_id: string;
  projekt_name: string;
  instrument: string;
  rolle: string | null;
  zeitpunkt: string;
  submitted_at: string;
  antworten_bytes: number;
}

export interface AntwortenDetail extends AntwortenMeta {
  schema_version: string;
  token_hash: string | null;
  antworten: Record<string, unknown>;
}

export interface Statistik {
  projekt: string;
  instrument: string;
  rolle: string | null;
  zeitpunkt: string;
  anzahl: number;
}

export function fetchStatistik(): Promise<Statistik[]> {
  return adminFetch<Statistik[]>('/admin/statistik');
}

export function fetchAntworten(filters?: {
  projekt_id?: string;
  instrument?: string;
  rolle?: string;
}): Promise<AntwortenMeta[]> {
  const params = new URLSearchParams();
  if (filters?.projekt_id) params.set('projekt_id', filters.projekt_id);
  if (filters?.instrument)  params.set('instrument',  filters.instrument);
  if (filters?.rolle)       params.set('rolle',        filters.rolle);
  const qs = params.toString();
  return adminFetch<AntwortenMeta[]>(`/admin/antworten${qs ? '?' + qs : ''}`);
}

export function fetchAntwortenDetail(id: string): Promise<AntwortenDetail> {
  return adminFetch<AntwortenDetail>(`/admin/antworten/${id}`);
}
