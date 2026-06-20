import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import './db.js'; // init DB + schema + seed
import { projekteRoutes } from './routes/projekte.js';
import { antwortenRoutes } from './routes/antworten.js';
import { adminAntwortenRoutes } from './routes/adminAntworten.js';

const PORT   = Number(process.env.PORT ?? 3001);
const ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
const IS_PROD = process.env.NODE_ENV === 'production';

const __dir      = dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = join(__dir, '..', '..', 'frontend', 'dist');

const app = Fastify({ logger: { level: 'info' } });

// CORS — nur in Dev nötig; in Prod läuft alles auf einem Server
if (!IS_PROD) {
  await app.register(cors, {
    origin: ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
}

// API-Routen
await app.register(projekteRoutes);
await app.register(antwortenRoutes);
await app.register(adminAntwortenRoutes);

// Health check
app.get('/api/health', async () => ({ ok: true }));

// Frontend ausliefern (nur wenn dist/ gebaut wurde)
if (existsSync(STATIC_DIR)) {
  await app.register(fastifyStatic, { root: STATIC_DIR });

  // SPA-Fallback: alle Nicht-API-Routen (z. B. /admin) → index.html
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api')) {
      return reply.status(404).send({ error: 'Not found' });
    }
    return reply.sendFile('index.html');
  });

  console.log(`[static] Serving frontend from ${STATIC_DIR}`);
} else {
  console.log('[static] No frontend/dist found — API-only mode (run: cd frontend && npm run build)');
}

try {
  // In Prod auf 0.0.0.0 hören damit der Server von außen erreichbar ist
  await app.listen({ port: PORT, host: IS_PROD ? '0.0.0.0' : '127.0.0.1' });
  console.log(`[server] http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
