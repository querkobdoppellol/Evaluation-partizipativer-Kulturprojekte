import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from './types';

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function requireAdmin(): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const auth = c.req.header('Authorization') ?? '';
    const [scheme, token] = auth.split(' ');
    const expected = await sha256hex(c.env.ADMIN_PASSWORD ?? '');
    if (scheme !== 'Bearer' || token !== expected) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return next();
  };
}

export async function loginHandler(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json<{ password?: string }>();
  const password = c.env.ADMIN_PASSWORD ?? '';
  if (body.password === password) {
    const token = await sha256hex(password);
    return c.json({ token });
  }
  return c.json({ error: 'Falsches Passwort' }, 401);
}
