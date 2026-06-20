import type { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';

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

export async function adminAntwortenRoutes(app: FastifyInstance) {
  // ── Liste: alle Einreichungen (Metadaten, kein antworten-JSON) ────────────
  app.get<{
    Querystring: { projekt_id?: string; instrument?: string; rolle?: string }
  }>(
    '/api/admin/antworten',
    { preHandler: requireAdmin },
    async (req) => {
      const { projekt_id, instrument, rolle } = req.query;

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
      const params: string[] = [];

      if (projekt_id) { sql += ' AND a.projekt_id = ?'; params.push(projekt_id); }
      if (instrument)  { sql += ' AND a.instrument = ?'; params.push(instrument); }
      if (rolle)       { sql += ' AND a.rolle = ?';      params.push(rolle); }

      sql += ' ORDER BY a.submitted_at DESC';

      return db.prepare(sql).all(...params);
    },
  );

  // ── Einzelne Einreichung mit vollständigen Antworten ─────────────────────
  app.get<{ Params: { id: string } }>(
    '/api/admin/antworten/:id',
    { preHandler: requireAdmin },
    async (req, reply) => {
      const row = db.prepare(`
        SELECT a.*, p.name AS projekt_name
        FROM antworten a
        LEFT JOIN projekte p ON p.id = a.projekt_id
        WHERE a.id = ?
      `).get(req.params.id) as AntwortenRow | undefined;

      if (!row) return reply.status(404).send({ error: 'Nicht gefunden' });

      return {
        ...row,
        antworten: JSON.parse(row.antworten),
      };
    },
  );

  // ── Statistik: Anzahl pro Instrument/Rolle pro Projekt ───────────────────
  app.get(
    '/api/admin/statistik',
    { preHandler: requireAdmin },
    async () => {
      return db.prepare(`
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
    },
  );
}
