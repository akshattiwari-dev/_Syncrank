import { prisma } from '@syncrank/db'
import { logger } from './logger.js'

/**
 * Fire-and-forget delivery to any webhooks a user registered for a given
 * event. Failures are logged, never thrown — a broken webhook URL must
 * never block the sync/lifecycle job that triggered it.
 */
export async function dispatchWebhook(userId: string, event: string, payload: unknown): Promise<void> {
  const hooks = await prisma.webhook.findMany({
    where: { userId, active: true, events: { has: event } },
  })

  await Promise.all(
    hooks.map(async (hook) => {
      try {
        const res = await fetch(hook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, payload, at: new Date().toISOString() }),
        })
        if (!res.ok) {
          logger.warn({ msg: 'webhook delivery failed', url: hook.url, status: res.status })
        }
      } catch (err) {
        logger.warn({ msg: 'webhook delivery error', url: hook.url, error: (err as Error).message })
      }
    }),
  )
}