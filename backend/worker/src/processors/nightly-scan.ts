import { prisma } from '@syncrank/db'
import { logger } from '../lib/logger.js'
import { enqueueUserSync } from '../lib/queues.js'
import { recomputeCampusRanks } from '../lib/recompute-ranks.js'

/**
 * The nightly scan doesn't sync anyone itself — it just enumerates every
 * user with at least one linked handle and enqueues an individual sync job
 * per user, reusing the exact same code path (and rate limiting, retries,
 * logging) as an on-demand "Sync now" click. After the batch finishes,
 * campus ranks are recomputed once rather than after every single sync.
 */
export async function processNightlyScan(): Promise<void> {
  const links = await prisma.handleLink.findMany({
    where: { OR: [{ cfHandle: { not: null } }, { lcUsername: { not: null } }] },
    select: { userId: true, user: { select: { campusId: true } } },
  })

  logger.info({ msg: 'nightly scan starting', usersToSync: links.length })

  for (const link of links as Array<{ userId: string; user: { campusId: string } }>) {
    await enqueueUserSync(link.userId)
  }

  // Rank recompute runs on a short delay after enqueueing, giving the sync
  // jobs a head start. In a stricter setup this would instead be a
  // separate "batch complete" signal (e.g. BullMQ flow), but a delay is a
  // reasonable, simple approximation for a nightly (not real-time) job.
  const campusIds = [...new Set((links as Array<{ user: { campusId: string } }>).map((l) => l.user.campusId))]
  setTimeout(
    () => {
      recomputeCampusRanks(campusIds).catch((err) => logger.error({ msg: 'post-scan rank recompute failed', err: err.message }))
    },
    5 * 60 * 1000,
  )
}
