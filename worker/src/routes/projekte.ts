import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAdmin, loginHandler } from '../auth';

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

const app = new Hono<{ Bindings: Env }>();

// ── Public: aktive Projekte ─────────────────────────────────────────────────
app.get('/projekte', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT id, name, traeger FROM projekte WHERE aktiv=1 ORDER BY name')
    .all<Pick<ProjektRow, 'id' | 'name' | 'traeger'>>();
  return c.json(results);
});

// ── Login ───────────────────────────────────────────────────────────────────
app.post('/admin/login', loginHandler);

// ── Admin: alle Projekte ────────────────────────────────────────────────────
app.get('/admin/projekte', requireAdmin(), async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT * FROM projekte ORDER BY name')
    .all<ProjektRow>();
  return c.json(results.map(toJson));
});

// ── Admin: Projekt anlegen ──────────────────────────────────────────────────
app.post('/admin/projekte', requireAdmin(), async (c) => {
  const body = await c.req.json<{
    name: string; traeger?: string; start?: string; ende?: string
  }>();
  if (!body.name?.trim()) return c.json({ error: 'name ist Pflicht' }, 400);

  const id = crypto.randomUUID();
  await c.env.DB
    .prepare('INSERT INTO projekte (id, name, aktiv, traeger, start, ende) VALUES (?, ?, 1, ?, ?, ?)')
    .bind(id, body.name.trim(), body.traeger ?? null, body.start ?? null, body.ende ?? null)
    .run();

  const row = await c.env.DB
    .prepare('SELECT * FROM projekte WHERE id=?')
    .bind(id)
    .first<ProjektRow>();
  return c.json(toJson(row!), 201);
});

// ── Admin: Projekt aktualisieren ────────────────────────────────────────────
app.patch('/admin/projekte/:id', requireAdmin(), async (c) => {
  const { id } = c.req.param();
  const existing = await c.env.DB
    .prepare('SELECT * FROM projekte WHERE id=?')
    .bind(id)
    .first<ProjektRow>();
  if (!existing) return c.json({ error: 'Nicht gefunden' }, 404);

  const body = await c.req.json<{
    name?: string; aktiv?: boolean;
    traeger?: string; start?: string; ende?: string;
  }>();

  const name    = body.name?.trim()                         ?? existing.name;
  const aktiv   = body.aktiv !== undefined ? (body.aktiv ? 1 : 0) : existing.aktiv;
  const traeger = body.traeger !== undefined ? (body.traeger || null) : existing.traeger;
  const start   = body.start   !== undefined ? (body.start   || null) : existing.start;
  const ende    = body.ende    !== undefined ? (body.ende    || null) : existing.ende;

  await c.env.DB
    .prepare('UPDATE projekte SET name=?, aktiv=?, traeger=?, start=?, ende=? WHERE id=?')
    .bind(name, aktiv, traeger, start, ende, id)
    .run();

  const updated = await c.env.DB
    .prepare('SELECT * FROM projekte WHERE id=?')
    .bind(id)
    .first<ProjektRow>();
  return c.json(toJson(updated!));
});

// ── Admin: Projekt löschen ──────────────────────────────────────────────────
app.delete('/admin/projekte/:id', requireAdmin(), async (c) => {
  const { id } = c.req.param();
  const ref = await c.env.DB
    .prepare('SELECT COUNT(*) AS n FROM antworten WHERE projekt_id=?')
    .bind(id)
    .first<{ n: number }>();
  if ((ref?.n ?? 0) > 0) {
    return c.json(
      { error: `Projekt hat ${ref!.n} Antwort(en) – zuerst Antworten löschen.` },
      409,
    );
  }
  const result = await c.env.DB
    .prepare('DELETE FROM projekte WHERE id=?')
    .bind(id)
    .run();
  if (result.meta.changes === 0) return c.json({ error: 'Nicht gefunden' }, 404);
  return c.json({ ok: true });
});

export { app as projekteApp };
