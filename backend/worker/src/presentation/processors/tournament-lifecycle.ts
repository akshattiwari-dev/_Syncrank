import { prisma } from '@syncrank/db'
import { logger } from '../../infrastructure/logging/logger.js'
import { computeCampusTournamentScore } from '../../application/services/tournament-score.js'

/** Polled alongside contest lifecycle — flips status and (re)computes scores. */
export async function scanAndUpdateTournaments(): Promise<void> {
  const now = new Date()

  const toStart = await prisma.tournament.findMany({ where: { status: 'upcoming', windowStart: { lte: now } } })
  for (const t of toStart) {
    await prisma.tournament.update({ where: { id: t.id }, data: { status: 'live' } })
  }

  const live = await prisma.tournament.findMany({ where: { status: 'live' } })
  for (const t of live) {
    const [scoreA, scoreB] = await Promise.all([
      computeCampusTournamentScore(t.campusAId, t.windowStart, now),
      computeCampusTournamentScore(t.campusBId, t.windowStart, now),
    ])
    const finished = t.windowEnd.getTime() <= now.getTime()
    await prisma.tournament.update({
      where: { id: t.id },
      data: { scoreA, scoreB, status: finished ? 'completed' : 'live' },
    })
  }

  if (toStart.length > 0 || live.length > 0) {
    logger.info({ msg: 'tournament scan complete', started: toStart.length, updated: live.length })
  }
}