
import type { FastifyInstance } from 'fastify'
import { ContactInput } from '@syncrank/shared'
import { prisma } from '@syncrank/db'
import { logger } from '../../infrastructure/logging/logger.js'

export async function contactRoutes(app: FastifyInstance) {
  app.post('/contact', { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } }, async (req, reply) => {
    const parsed = ContactInput.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() })
    }
    const submission = await prisma.contactSubmission.create({ data: parsed.data })
    logger.info({ msg: 'contact form submission received', id: submission.id, email: submission.email })
    return reply.code(201).send({ ok: true })
  })
}