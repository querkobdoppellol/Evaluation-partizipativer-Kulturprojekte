import { Hono } from 'hono';
import type { Env } from '../types';

interface AntwortenBody {
  projekt_id: string;
  instrument?: string;
  rolle?: string;
  zeitpunkt: 'pre' | 'post';
  antworten: Record<string, unknown>;
  schema_version: string;
  token_hash?: string | null;
}

const app = new Hono<{ Bindings: Env }>();

app.post('/antworten', async (c) => {
  const body = await c.req.json<AntwortenBody>();
  const {
    projekt_id, instrument, rolle,
    zeitpunkt, antworten, schema_version, token_hash,
  } = body ?? {};

  if (!projekt_id || !zeitpunkt || !antworten || !schema_version) {
    return c.json({ error: 'Fehlende Pflichtfelder' }, 400);
  }
  if (zeitpunkt !== 'pre' && zeitpunkt !== 'post') {
    return c.json({ error: 'zeitpunkt muss "pre" oder "post" sein' }, 400);
  }

  const projekt = await c.env.DB
    .prepare('SELECT id FROM projekte WHERE id=?')
    .bind(projekt_id)
    .first();
  if (!projekt) return c.json({ error: 'projekt_id nicht gefunden' }, 404);

  const id = crypto.randomUUID();
  await c.env.DB
    .prepare(`
      INSERT INTO antworten
        (id, projekt_id, instrument, rolle, zeitpunkt, token_hash, schema_version, antworten)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      projekt_id,
      instrument   ?? 'B',
      rolle        ?? null,
      zeitpunkt,
      token_hash   ?? null,
      schema_version,
      JSON.stringify(antworten),
    )
    .run();

  return c.json({ ok: true, id }, 201);
});

export { app as antwortenApp };
