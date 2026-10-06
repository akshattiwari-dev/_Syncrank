import { prisma } from '@syncrank/db'

/**
 * Aggregate rating-gain score for one campus's top 20 participants across
 * a tournament window: (syncScore at windowEnd) minus (syncScore at
 * windowStart), summed over the top 20 positive gainers. Students with no
 * snapshot before windowStart are treated as starting at 0.
 */
export async function computeCampusTournamentScore(
  campusId: string,
  windowStart: Date,
  windowEnd: Date,
): Promise<number> {
  const students = await prisma.user.findMany({ where: { campusId, role: 'student' }, select: { id: true } })
  const ids = students.map((s) => s.id)
  if (ids.length === 0) return 0

  const [startSnaps, endSnaps] = await Promise.all([
    prisma.ratingSnapshot.findMany({
      where: { userId: { in: ids }, createdAt: { lte: windowStart } },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
    }),
    prisma.ratingSnapshot.findMany({
      where: { userId: { in: ids }, createdAt: { lte: windowEnd } },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
    }),
  ])
  const startByUser = new Map(startSnaps.map((s) => [s.userId, s.syncScore]))
  const endByUser = new Map(endSnaps.map((s) => [s.userId, s.syncScore]))

  const deltas = ids
    .map((id) => (endByUser.get(id) ?? 0) - (startByUser.get(id) ?? 0))
    .sort((a, b) => b - a)
    .slice(0, 20)

  return deltas.reduce((sum, d) => sum + Math.max(0, d), 0)
}