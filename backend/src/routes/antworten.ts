import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';

interface AntwortenBody {
  projekt_id: string;
  zeitpunkt: 'pre' | 'post';
  antworten: Record<string, unknown>;
  schema_version: string;
  token_hash?: string | null;
}

export async function antwortenRoutes(app: FastifyInstance) {
  // ── POST /api/antworten ── anonyme Einreichung ─────────────────────────────
  app.post<{ Body: AntwortenBody }>(
    '/api/antworten',
    async (req, reply) => {
      const { projekt_id, zeitpunkt, antworten, schema_version, token_hash } = req.body ?? {};

      // Validierung
      if (!projekt_id || !zeitpunkt || !antworten || !schema_version) {
        return reply.status(400).send({ error: 'Fehlende Pflichtfelder' });
      }
      if (zeitpunkt !== 'pre' && zeitpunkt !== 'post') {
        return reply.status(400).send({ error: 'zeitpunkt muss "pre" oder "post" sein' });
      }

      // Projekt muss existieren
      const projekt = db.prepare('SELECT id FROM projekte WHERE id=?').get(projekt_id);
      if (!projekt) {
        return reply.status(404).send({ error: 'projekt_id nicht gefunden' });
      }

      const id = randomUUID();
      db.prepare(`
        INSERT INTO antworten
          (id, projekt_id, instrument, zeitpunkt, token_hash, schema_version, antworten)
        VALUES (?, ?, 'B', ?, ?, ?, ?)
      `).run(
        id,
        projekt_id,
        zeitpunkt,
        token_hash ?? null,
        schema_version,
        JSON.stringify(antworten),
      );

      reply.status(201);
      return { ok: true, id };
    },
  );
}
