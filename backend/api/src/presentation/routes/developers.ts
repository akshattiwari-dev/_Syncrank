import type { FastifyInstance } from 'fastify'
import { ApiKeyLabelInput } from '@syncrank/shared'
import { prisma } from '@syncrank/db'
import { generateApiKey, apiKeyAuth } from '../../infrastructure/auth/apiKeyAuth.js'

export async function developerRoutes(app: FastifyInstance) {
  app.get('/developer/keys', { preHandler: app.requireAuth }, async (req, reply) => {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user!.sub, revokedAt: null },
      select: { id: true, label: true, keyPreview: true, createdAt: true, lastUsedAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ keys })
  })

  app.post(
    '/developer/keys',
    { preHandler: app.requireAuth, config: { rateLimit: { max: 5, timeWindow: '1 hour' } } },
    async (req, reply) => {
      const parsed = ApiKeyLabelInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
      }
      const { raw, hash, preview } = generateApiKey()
      const key = await prisma.apiKey.create({
        data: { userId: req.user!.sub, label: parsed.data.label, keyHash: hash, keyPreview: preview },
      })
      // The raw key is shown exactly once — it is never retrievable again.
      return reply.code(201).send({ id: key.id, label: key.label, key: raw, createdAt: key.createdAt })
    },
  )

  app.delete('/developer/keys/:id', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const key = await prisma.apiKey.findUnique({ where: { id } })
    if (!key || key.userId !== req.user!.sub) {
      return reply.code(404).send({ error: 'Key not found', code: 'NOT_FOUND' })
    }
    await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } })
    return reply.send({ ok: true })
  })

  // Public, read-only, API-key-authenticated endpoint for external tools
  // (Discord bots, hackathon widgets) — separate auth path from the
  // cookie-based session auth used everywhere else.
  app.get(
    '/developer/v1/leaderboard/:campusId',
    { preHandler: apiKeyAuth, config: { rateLimit: { max: 100, timeWindow: '1 hour' } } },
    async (req, reply) => {
      const { campusId } = req.params as { campusId: string }
      const users = await prisma.user.findMany({
        where: { campusId, role: 'student' },
        select: { id: true, name: true },
        take: 50,
      })
      const snapshots = await prisma.ratingSnapshot.findMany({
        where: { userId: { in: users.map((u) => u.id) } },
        orderBy: { createdAt: 'desc' },
        distinct: ['userId'],
      })
      const snapByUser = new Map(snapshots.map((s) => [s.userId, s]))
      const rows = users
        .map((u) => ({ name: u.name, syncScore: snapByUser.get(u.id)?.syncScore ?? 0 }))
        .sort((a, b) => b.syncScore - a.syncScore)

      return reply.send({ campusId, rows })
    },
  )
}