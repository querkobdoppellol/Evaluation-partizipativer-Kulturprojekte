import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';

interface ProjektRow {
  id: string;
  name: string;
  aktiv: number;
  traeger: string | null;
  steckbrief_id: string | null;
  start: string | null;
  ende: string | null;
  created_at: string;
}

function toJson(row: ProjektRow) {
  return { ...row, aktiv: row.aktiv === 1 };
}

export async function projekteRoutes(app: FastifyInstance) {
  // ── Public: nur aktive Projekte (für meta_projekt im Teilnehmer-Flow) ──────
  app.get('/api/projekte', async () => {
    const rows = db
      .prepare('SELECT id, name, traeger FROM projekte WHERE aktiv=1 ORDER BY name')
      .all() as Pick<ProjektRow, 'id' | 'name' | 'traeger'>[];
    return rows;
  });

  // ── Admin Login ────────────────────────────────────────────────────────────
  app.post<{ Body: { password?: string } }>(
    '/api/admin/login',
    async (req, reply) => {
      const { loginHandler } = await import('../auth.js');
      return loginHandler(req, reply);
    },
  );

  // ── Admin: alle Projekte ───────────────────────────────────────────────────
  app.get(
    '/api/admin/projekte',
    { preHandler: requireAdmin },
    async () => {
      const rows = db
        .prepare('SELECT * FROM projekte ORDER BY name')
        .all() as ProjektRow[];
      return rows.map(toJson);
    },
  );

  // ── Admin: Projekt anlegen ─────────────────────────────────────────────────
  app.post<{ Body: { name: string; traeger?: string; start?: string; ende?: string } }>(
    '/api/admin/projekte',
    { preHandler: requireAdmin },
    async (req, reply) => {
      const { name, traeger, start, ende } = req.body ?? {};
      if (!name?.trim()) return reply.status(400).send({ error: 'name ist Pflicht' });
      const id = randomUUID();
      db.prepare(
        'INSERT INTO projekte (id, name, aktiv, traeger, start, ende) VALUES (?, ?, 1, ?, ?, ?)',
      ).run(id, name.trim(), traeger ?? null, start ?? null, ende ?? null);
      const row = db.prepare('SELECT * FROM projekte WHERE id=?').get(id) as ProjektRow;
      reply.status(201);
      return toJson(row);
    },
  );

  // ── Admin: Projekt aktualisieren (name, aktiv, traeger, start, ende) ───────
  app.patch<{
    Params: { id: string };
    Body: { name?: string; aktiv?: boolean; traeger?: string; start?: string; ende?: string };
  }>(
    '/api/admin/projekte/:id',
    { preHandler: requireAdmin },
    async (req, reply) => {
      const { id } = req.params;
      const existing = db.prepare('SELECT * FROM projekte WHERE id=?').get(id) as ProjektRow | undefined;
      if (!existing) return reply.status(404).send({ error: 'Nicht gefunden' });

      const name    = req.body.name?.trim()  ?? existing.name;
      const aktiv   = req.body.aktiv !== undefined ? (req.body.aktiv ? 1 : 0) : existing.aktiv;
      const traeger = req.body.traeger       !== undefined ? (req.body.traeger || null) : existing.traeger;
      const start   = req.body.start         !== undefined ? (req.body.start   || null) : existing.start;
      const ende    = req.body.ende          !== undefined ? (req.body.ende    || null) : existing.ende;

      db.prepare(
        'UPDATE projekte SET name=?, aktiv=?, traeger=?, start=?, ende=? WHERE id=?',
      ).run(name, aktiv, traeger, start, ende, id);

      const updated = db.prepare('SELECT * FROM projekte WHERE id=?').get(id) as ProjektRow;
      return toJson(updated);
    },
  );

  // ── Admin: Projekt löschen (nur wenn keine Antworten verweisen) ────────────
  app.delete<{ Params: { id: string } }>(
    '/api/admin/projekte/:id',
    { preHandler: requireAdmin },
    async (req, reply) => {
      const { id } = req.params;
      const refCount = (
        db.prepare('SELECT COUNT(*) AS n FROM antworten WHERE projekt_id=?').get(id) as { n: number }
      ).n;
      if (refCount > 0) {
        return reply.status(409).send({
          error: `Projekt hat ${refCount} Antwort(en) – zuerst Antworten löschen.`,
        });
      }
      const changes = (db.prepare('DELETE FROM projekte WHERE id=?').run(id) as { changes: number }).changes;
      if (changes === 0) return reply.status(404).send({ error: 'Nicht gefunden' });
      return { ok: true };
    },
  );
}
