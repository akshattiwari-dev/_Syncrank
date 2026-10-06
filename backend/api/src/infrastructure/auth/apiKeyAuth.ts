import crypto from 'node:crypto'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@syncrank/db'

export function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export function generateApiKey(): { raw: string; hash: string; preview: string } {
  const raw = `sk_live_${crypto.randomBytes(24).toString('hex')}`
  return { raw, hash: hashApiKey(raw), preview: `${raw.slice(0, 11)}...${raw.slice(-4)}` }
}

/**
 * Alternate auth path for the public read-only developer API: reads
 * Authorization: Bearer <key> instead of the session cookie. Attaches a
 * minimal req.user so downstream handlers don't need to know the
 * difference between a browser session and an API key caller.
 */
export async function apiKeyAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing API key', code: 'UNAUTHENTICATED' })
  }
  const raw = header.slice('Bearer '.length).trim()
  const key = await prisma.apiKey.findUnique({ where: { keyHash: hashApiKey(raw) } })
  if (!key || key.revokedAt) {
    return reply.code(401).send({ error: 'Invalid or revoked API key', code: 'INVALID_API_KEY' })
  }

  const user = await prisma.user.findUnique({ where: { id: key.userId } })
  if (!user) {
    return reply.code(401).send({ error: 'Invalid API key', code: 'INVALID_API_KEY' })
  }

  req.user = { sub: user.id, role: user.role, campusId: user.campusId, tokenVersion: user.tokenVersion }
  // Fire-and-forget usage tracking — must never block the request.
  prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => {})
}