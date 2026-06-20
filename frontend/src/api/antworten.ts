import { apiFetch } from './client';
import type { Answers } from '../types/instrument';

export interface AntwortenPayload {
  projekt_id: string;
  zeitpunkt: 'pre' | 'post';
  schema_version: string;
  antworten: Record<string, unknown>;
  token_hash?: string | null;
}

export interface AntwortenResult {
  ok: boolean;
  id: string;
}

export function submitAntworten(payload: AntwortenPayload): Promise<AntwortenResult> {
  return apiFetch<AntwortenResult>('/antworten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Merge answers + scan booleans into the submission payload */
export function buildPayload(
  projektId: string,
  zeitpunkt: 'pre' | 'post',
  answers: Answers,
  scanData: Record<string, boolean>,
  schemaVersion = '1.0',
): AntwortenPayload {
  return {
    projekt_id: projektId,
    zeitpunkt,
    schema_version: schemaVersion,
    antworten: { ...answers, ...scanData } as Record<string, unknown>,
    token_hash: null,
  };
}
