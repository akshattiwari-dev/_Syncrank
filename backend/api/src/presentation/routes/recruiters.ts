import type { FastifyInstance } from 'fastify'
import { RecruiterQuery } from '@syncrank/shared'
import { prisma } from '@syncrank/db'

export async function recruiterRoutes(app: FastifyInstance) {
  // Gated behind campus_admin for v1 — a dedicated "recruiter" role/signup
  // flow is out of scope for now; see README.
  app.get('/recruiters/candidates', { preHandler: app.requireRole('campus_admin') }, async (req, reply) => {
    const parsed = RecruiterQuery.safeParse(req.query)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid query', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
    }
    const { minScore, page, pageSize } = parsed.data

    const users = await prisma.user.findMany({
      where: { role: 'student', visibleToRecruiters: true },
      select: {
        id: true,
        name: true,
        branch: true,
        gradYear: true,
        campus: { select: { name: true } },
        handleLink: { select: { cfHandle: true, lcUsername: true } },
      },
    })

    const snapshots = await prisma.ratingSnapshot.findMany({
      where: { userId: { in: users.map((u) => u.id) } },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
    })
    const snapByUser = new Map(snapshots.map((s) => [s.userId, s]))

    const merged = users
      .map((u) => {
        const snap = snapByUser.get(u.id)
        return {
          id: u.id,
          name: u.name,
          branch: u.branch,
          gradYear: u.gradYear,
          campus: u.campus.name,
          cfHandle: u.handleLink?.cfHandle ?? null,
          lcUsername: u.handleLink?.lcUsername ?? null,
          cfRating: snap?.cfRating ?? null,
          lcSolvedTotal: snap?.lcSolvedTotal ?? null,
          score: snap?.syncScore ?? 0,
        }
      })
      .filter((c) => c.score >= minScore)
      .sort((a, b) => b.score - a.score)

    const start = (page - 1) * pageSize
    const rows = merged.slice(start, start + pageSize)

    return reply.send({ total: merged.length, page, pageSize, rows })
  })
}