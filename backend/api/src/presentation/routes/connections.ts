import type { FastifyInstance } from 'fastify'
import { ConnectionRequestInput, ConnectionRespondInput } from '@syncrank/shared'
import { prisma } from '@syncrank/db'

export async function connectionRoutes(app: FastifyInstance) {
  // ---- Mock interview matches: same-campus students within ~80 CF rating ----
  app.get('/interviews/matches', { preHandler: app.requireAuth }, async (req, reply) => {
    const mySnap = await prisma.ratingSnapshot.findFirst({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
    })
    const myRating = mySnap?.cfRating ?? 0

    const candidates = await prisma.user.findMany({
      where: { campusId: req.user!.campusId, role: 'student', id: { not: req.user!.sub } },
      select: { id: true, name: true, campus: { select: { name: true } } },
      take: 100,
    })
    const snapshots = await prisma.ratingSnapshot.findMany({
      where: { userId: { in: candidates.map((c) => c.id) } },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
    })
    const snapByUser = new Map(snapshots.map((s) => [s.userId, s]))

    const matches = candidates
      .map((c) => ({
        id: c.id,
        name: c.name,
        campus: c.campus.name,
        cfRating: snapByUser.get(c.id)?.cfRating ?? null,
      }))
      .filter((c) => c.cfRating != null && Math.abs(c.cfRating - myRating) <= 80)
      .sort((a, b) => Math.abs((a.cfRating ?? 0) - myRating) - Math.abs((b.cfRating ?? 0) - myRating))
      .slice(0, 20)

    return reply.send({ matches })
  })

  // ---- Mentors: opted-in students/alumni ----
  app.get('/mentorship/mentors', { preHandler: app.requireAuth }, async (_req, reply) => {
    const mentors = await prisma.user.findMany({
      where: { isMentor: true },
      select: { id: true, name: true, mentorTags: true, campus: { select: { name: true } } },
      take: 50,
    })
    return reply.send({ mentors })
  })

  // ---- Generic connection request — covers both interview + mentorship asks ----
  app.post(
    '/connections',
    { preHandler: app.requireAuth, config: { rateLimit: { max: 20, timeWindow: '1 hour' } } },
    async (req, reply) => {
      const parsed = ConnectionRequestInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
      }
      const { targetId, kind, message } = parsed.data
      if (targetId === req.user!.sub) {
        return reply.code(400).send({ error: 'Cannot request yourself', code: 'INVALID_TARGET' })
      }
      const target = await prisma.user.findUnique({ where: { id: targetId } })
      if (!target) return reply.code(404).send({ error: 'Target user not found', code: 'NOT_FOUND' })

      const existing = await prisma.connectionRequest.findFirst({
        where: { requesterId: req.user!.sub, targetId, kind, status: 'pending' },
      })
      if (existing) {
        return reply.code(409).send({ error: 'Request already pending', code: 'ALREADY_REQUESTED' })
      }

      const request = await prisma.connectionRequest.create({
        data: { requesterId: req.user!.sub, targetId, kind, message },
      })
      return reply.code(201).send({ request })
    },
  )

  app.get('/connections', { preHandler: app.requireAuth }, async (req, reply) => {
    const [sent, received] = await Promise.all([
      prisma.connectionRequest.findMany({
        where: { requesterId: req.user!.sub },
        include: { target: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.connectionRequest.findMany({
        where: { targetId: req.user!.sub },
        include: { requester: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    return reply.send({ sent, received })
  })

  app.post('/connections/:id/respond', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const parsed = ConnectionRespondInput.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
    }
    const existing = await prisma.connectionRequest.findUnique({ where: { id } })
    if (!existing || existing.targetId !== req.user!.sub) {
      return reply.code(404).send({ error: 'Request not found', code: 'NOT_FOUND' })
    }
    if (existing.status !== 'pending') {
      return reply.code(409).send({ error: 'Request already resolved', code: 'ALREADY_RESOLVED' })
    }
    const request = await prisma.connectionRequest.update({
      where: { id },
      data: { status: parsed.data.status, respondedAt: new Date() },
    })
    return reply.send({ request })
  })
}