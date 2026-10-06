import type { FastifyInstance } from 'fastify'
import { prisma } from '@syncrank/db'

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
}

/**
 * v1 simplified practice signal — NOT per-topic weakness (that needs
 * per-submission CF/LC tag ingestion, which this project doesn't do yet;
 * see ARCHITECTURE.md "known limitations"). Instead compares your two
 * tracked signals (CF rating, LC last-30d solves) against your campus
 * average and suggests focusing on whichever lags further behind.
 */
export async function practiceRoutes(app: FastifyInstance) {
  app.get('/practice/plan', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.sub

    const [mySnapshot, campusSnapshots] = await Promise.all([
      prisma.ratingSnapshot.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.ratingSnapshot.findMany({
        where: { user: { campusId: req.user!.campusId, role: 'student' } },
        orderBy: { createdAt: 'desc' },
        distinct: ['userId'],
      }),
    ])

    const campusAvgCf = avg(campusSnapshots.map((s) => s.cfRating ?? 0).filter((n) => n > 0))
    const campusAvgLc30 = avg(campusSnapshots.map((s) => s.lcSolvedLast30d ?? 0))

    const myCf = mySnapshot?.cfRating ?? 0
    const myLc30 = mySnapshot?.lcSolvedLast30d ?? 0

    const cfGap = campusAvgCf > 0 ? Math.max(0, (campusAvgCf - myCf) / campusAvgCf) : 0
    const lcGap = campusAvgLc30 > 0 ? Math.max(0, (campusAvgLc30 - myLc30) / campusAvgLc30) : 0

    const plan = [
      {
        area: 'Codeforces rating',
        weak: Math.round(cfGap * 100),
        note: `Campus average CF rating: ${Math.round(campusAvgCf)}, yours: ${myCf}`,
      },
      {
        area: 'LeetCode recent activity',
        weak: Math.round(lcGap * 100),
        note: `Campus average last-30-day solves: ${Math.round(campusAvgLc30)}, yours: ${myLc30}`,
      },
    ].sort((a, b) => b.weak - a.weak)

    return reply.send({ plan })
  })
}