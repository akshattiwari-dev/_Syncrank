import { prisma } from '@syncrank/db'
import type { ContestLifecycleJobData } from '@syncrank/shared'
import type { Job } from 'bullmq'
import { logger } from '../lib/logger.js'
import { broadcastToRedis } from '../lib/pubsub.js'

export async function processContestLifecycleJob(job: Job<ContestLifecycleJobData>): Promise<void> {
  const { contestId, transition } = job.data

  const contest = await prisma.contest.findUnique({ where: { id: contestId } })
  if (!contest) {
    logger.warn({ msg: 'contest lifecycle job for missing contest, skipping', contestId })
    return
  }

  if (transition === 'start') {
    if (contest.status !== 'scheduled') return // already transitioned, or was edited back to draft
    await prisma.contest.update({ where: { id: contestId }, data: { status: 'live' } })
    logger.info({ msg: 'contest transitioned to live', contestId, title: contest.title })
    await broadcastToRedis(contestId, { type: 'status', status: 'live' })
  }

  if (transition === 'complete') {
    if (contest.status !== 'live') return
    await prisma.contest.update({ where: { id: contestId }, data: { status: 'completed' } })
    logger.info({ msg: 'contest transitioned to completed', contestId, title: contest.title })
    await broadcastToRedis(contestId, { type: 'status', status: 'completed' })
  }
}

/**
 * Scans for contests whose scheduled transition time has passed and
 * enqueues the appropriate lifecycle job. This is the "scheduler" half —
 * run on a poll interval from main.ts rather than relying purely on
 * one-shot delayed jobs, so a worker restart never loses a transition.
 */
export async function scanAndEnqueueTransitions(
  enqueue: (data: ContestLifecycleJobData) => Promise<void>,
): Promise<void> {
  const now = new Date()

  const toStart = await prisma.contest.findMany({
    where: { status: 'scheduled', startAt: { lte: now } },
    select: { id: true },
  })
  for (const c of toStart as Array<{ id: string }>) {
    await enqueue({ contestId: c.id, transition: 'start' })
  }

  const liveContests = await prisma.contest.findMany({
    where: { status: 'live' },
    select: { id: true, startAt: true, durationMins: true },
  })
  for (const c of liveContests as Array<{ id: string; startAt: Date | null; durationMins: number }>) {
    if (!c.startAt) continue
    const endsAt = new Date(c.startAt.getTime() + c.durationMins * 60_000)
    if (endsAt <= now) {
      await enqueue({ contestId: c.id, transition: 'complete' })
    }
  }
}
