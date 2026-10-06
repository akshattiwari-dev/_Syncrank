import type { FastifyInstance } from 'fastify'
import { CreateTournamentInput } from '@syncrank/shared'
import { prisma } from '@syncrank/db'

export async function tournamentRoutes(app: FastifyInstance) {
  app.get('/tournaments', { preHandler: app.requireAuth }, async (_req, reply) => {
    const tournaments = await prisma.tournament.findMany({
      orderBy: [{ status: 'asc' }, { windowStart: 'asc' }],
      include: { campusA: { select: { name: true } }, campusB: { select: { name: true } } },
    })
    return reply.send({ tournaments })
  })

  app.post('/tournaments', { preHandler: app.requireRole('campus_admin') }, async (req, reply) => {
    const parsed = CreateTournamentInput.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
    }
    const { windowStart, windowEnd, ...rest } = parsed.data
    if (new Date(windowEnd) <= new Date(windowStart)) {
      return reply.code(400).send({ error: 'windowEnd must be after windowStart', code: 'INVALID_WINDOW' })
    }
    const tournament = await prisma.tournament.create({
      data: { ...rest, windowStart: new Date(windowStart), windowEnd: new Date(windowEnd) },
    })
    return reply.code(201).send({ tournament })
  })
}