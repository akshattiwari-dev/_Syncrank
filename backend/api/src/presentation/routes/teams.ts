import type { FastifyInstance } from 'fastify'
import { CreateTeamInput, TeamInviteInput, TeamInviteRespondInput } from '@syncrank/shared'
import { prisma } from '@syncrank/db'

export async function teamRoutes(app: FastifyInstance) {
  // v1 heuristic: suggest teammates whose rating is furthest from yours
  // within the campus — complementary strength rather than similarity.
  app.get('/teams/suggestions', { preHandler: app.requireAuth }, async (req, reply) => {
    const mySnap = await prisma.ratingSnapshot.findFirst({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
    })
    const myRating = mySnap?.cfRating ?? 0

    const candidates = await prisma.user.findMany({
      where: { campusId: req.user!.campusId, role: 'student', id: { not: req.user!.sub } },
      select: { id: true, name: true, handleLink: { select: { cfHandle: true } } },
      take: 100,
    })
    const snapshots = await prisma.ratingSnapshot.findMany({
      where: { userId: { in: candidates.map((c) => c.id) } },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
    })
    const snapByUser = new Map(snapshots.map((s) => [s.userId, s]))

    const suggestions = candidates
      .map((c) => ({
        id: c.id,
        name: c.name,
        cfHandle: c.handleLink?.cfHandle ?? null,
        cfRating: snapByUser.get(c.id)?.cfRating ?? 0,
      }))
      .sort((a, b) => Math.abs(b.cfRating - myRating) - Math.abs(a.cfRating - myRating))
      .slice(0, 12)

    return reply.send({ suggestions })
  })

  app.post('/teams', { preHandler: app.requireAuth }, async (req, reply) => {
    const parsed = CreateTeamInput.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
    }
    const { contestId, name } = parsed.data
    const contest = await prisma.contest.findUnique({ where: { id: contestId } })
    if (!contest) return reply.code(404).send({ error: 'Contest not found', code: 'NOT_FOUND' })

    const team = await prisma.team.create({
      data: {
        contestId,
        name,
        createdById: req.user!.sub,
        members: { create: { userId: req.user!.sub, status: 'accepted' } },
      },
      include: { members: true },
    })
    return reply.code(201).send({ team })
  })

  app.get('/teams', { preHandler: app.requireAuth }, async (req, reply) => {
    const { contestId } = req.query as { contestId?: string }
    const teams = await prisma.team.findMany({
      where: contestId ? { contestId } : { members: { some: { userId: req.user!.sub } } },
      include: { members: { include: { user: { select: { id: true, name: true } } } } },
    })
    return reply.send({ teams })
  })

  app.post('/teams/:id/invite', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const parsed = TeamInviteInput.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
    }
    const team = await prisma.team.findUnique({ where: { id } })
    if (!team) return reply.code(404).send({ error: 'Team not found', code: 'NOT_FOUND' })
    if (team.createdById !== req.user!.sub) {
      return reply.code(403).send({ error: 'Only the team creator can invite', code: 'FORBIDDEN' })
    }

    const member = await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: id, userId: parsed.data.userId } },
      update: {},
      create: { teamId: id, userId: parsed.data.userId, status: 'invited' },
    })
    return reply.code(201).send({ member })
  })

  app.post('/teams/invites/:memberId/respond', { preHandler: app.requireAuth }, async (req, reply) => {
    const { memberId } = req.params as { memberId: string }
    const parsed = TeamInviteRespondInput.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
    }
    const member = await prisma.teamMember.findUnique({ where: { id: memberId } })
    if (!member || member.userId !== req.user!.sub) {
      return reply.code(404).send({ error: 'Invite not found', code: 'NOT_FOUND' })
    }
    const updated = await prisma.teamMember.update({ where: { id: memberId }, data: { status: parsed.data.status } })
    return reply.send({ member: updated })
  })
}