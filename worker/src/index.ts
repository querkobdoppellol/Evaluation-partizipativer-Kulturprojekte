import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { projekteApp }       from './routes/projekte';
import { antwortenApp }      from './routes/antworten';
import { adminAntwortenApp } from './routes/adminAntworten';

const app = new Hono<{ Bindings: Env }>();

// CORS nur für lokalen Dev nötig — in Prod läuft alles auf derselben Domain
app.use('/api/*', cors({
  origin: ['http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/api/health', (c) => c.json({ ok: true, ts: Date.now() }));

app.route('/api', projekteApp);
app.route('/api', antwortenApp);
app.route('/api', adminAntwortenApp);

export default app;
