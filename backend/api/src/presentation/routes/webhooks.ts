import type { FastifyInstance } from 'fastify'
import { WebhookInput } from '@syncrank/shared'
import { prisma } from '@syncrank/db'

export async function webhookRoutes(app: FastifyInstance) {
  app.get('/webhooks', { preHandler: app.requireAuth }, async (req, reply) => {
    const webhooks = await prisma.webhook.findMany({ where: { userId: req.user!.sub } })
    return reply.send({ webhooks })
  })

  app.post(
    '/webhooks',
    { preHandler: app.requireAuth, config: { rateLimit: { max: 10, timeWindow: '1 hour' } } },
    async (req, reply) => {
      const parsed = WebhookInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
      }
      const webhook = await prisma.webhook.create({
        data: { userId: req.user!.sub, url: parsed.data.url, events: parsed.data.events },
      })
      return reply.code(201).send({ webhook })
    },
  )

  app.delete('/webhooks/:id', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const webhook = await prisma.webhook.findUnique({ where: { id } })
    if (!webhook || webhook.userId !== req.user!.sub) {
      return reply.code(404).send({ error: 'Webhook not found', code: 'NOT_FOUND' })
    }
    await prisma.webhook.delete({ where: { id } })
    return reply.send({ ok: true })
  })
}