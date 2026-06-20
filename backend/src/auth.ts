import { createHash } from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';

const PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin';

// Stateless token: SHA-256 of the password.
// The client sends this token as "Authorization: Bearer <token>".
export const ADMIN_TOKEN = createHash('sha256').update(PASSWORD).digest('hex');

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  const auth = req.headers.authorization ?? '';
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || token !== ADMIN_TOKEN) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export async function loginHandler(
  req: FastifyRequest<{ Body: { password?: string } }>,
  reply: FastifyReply,
) {
  if (req.body?.password === PASSWORD) {
    return { token: ADMIN_TOKEN };
  }
  reply.status(401).send({ error: 'Falsches Passwort' });
}
