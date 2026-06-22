import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAdmin } from '../auth';

interface AntwortenRow {
  id: string;
  projekt_id: string;
  projekt_name: string;
  instrument: string;
  rolle: string | null;
  zeitpunkt: string;
  schema_version: string;
  token_hash: string | null;
  submitted_at: string;
  antworten: string;
}

const app = new Hono<{ Bindings: Env }>();

// ── Liste aller Einreichungen (Metadaten) ───────────────────────────────────
app.get('/admin/antworten', requireAdmin(), async (c) => {
  const projekt_id = c.req.query('projekt_id');
  const instrument = c.req.query('instrument');
  const rolle      = c.req.query('rolle');

  let sql = `
    SELECT
      a.id, a.projekt_id, p.name AS projekt_name,
      a.instrument, a.rolle, a.zeitpunkt,
      a.schema_version, a.token_hash, a.submitted_at,
      LENGTH(a.antworten) AS antworten_bytes
    FROM antworten a
    LEFT JOIN projekte p ON p.id = a.projekt_id
    WHERE 1=1
  `;
  const params: unknown[] = [];
  if (projekt_id) { sql += ' AND a.projekt_id = ?'; params.push(projekt_id); }
  if (instrument)  { sql += ' AND a.instrument = ?'; params.push(instrument); }
  if (rolle)       { sql += ' AND a.rolle = ?';      params.push(rolle); }
  sql += ' ORDER BY a.submitted_at DESC';

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(results);
});

// ── Einzelne Einreichung mit vollständigen Antworten ────────────────────────
app.get('/admin/antworten/:id', requireAdmin(), async (c) => {
  const { id } = c.req.param();
  const row = await c.env.DB
    .prepare(`
      SELECT a.*, p.name AS projekt_name
      FROM antworten a
      LEFT JOIN projekte p ON p.id = a.projekt_id
      WHERE a.id = ?
    `)
    .bind(id)
    .first<AntwortenRow>();
  if (!row) return c.json({ error: 'Nicht gefunden' }, 404);
  return c.json({ ...row, antworten: JSON.parse(row.antworten) });
});

// ── Statistik: Anzahl pro Instrument/Rolle pro Projekt ──────────────────────
app.get('/admin/statistik', requireAdmin(), async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT
      p.name AS projekt,
      a.instrument,
      a.rolle,
      a.zeitpunkt,
      COUNT(*) AS anzahl
    FROM antworten a
    LEFT JOIN projekte p ON p.id = a.projekt_id
    GROUP BY a.projekt_id, a.instrument, a.rolle, a.zeitpunkt
    ORDER BY p.name, a.instrument, a.rolle, a.zeitpunkt
  `).all();
  return c.json(results);
});

export { app as adminAntwortenApp };
