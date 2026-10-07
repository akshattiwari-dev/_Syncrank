import type { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@syncrank/db'
import { sendOtpMail } from '../../infrastructure/mail/mailer.js'

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

const hashCode = (userId: string, code: string) =>
  crypto.createHash('sha256').update(`${userId}:${code}`).digest('hex')

const VerifyInput = z.object({ code: z.string().regex(/^\d{6}$/) })

export async function emailOtpRoutes(app: FastifyInstance) {
  app.post(
    '/auth/otp/send',
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
    },
    async (req, reply) => {
      const userId = req.user!.sub
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return reply.code(404).send({ error: 'User not found', code: 'NOT_FOUND' })
      if (user.emailVerifiedAt) return reply.send({ ok: true, alreadyVerified: true })

      const last = await prisma.emailOtp.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
        const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - last.createdAt.getTime())) / 1000)
        return reply.code(429).send({
          error: `Wait ${wait}s before requesting another code`,
          code: 'OTP_COOLDOWN',
        })
      }

      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
      await prisma.emailOtp.deleteMany({ where: { userId } })
      await prisma.emailOtp.create({
        data: { userId, codeHash: hashCode(userId, code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
      })

      try {
        await sendOtpMail(user.email, code)
      } catch (err) {
        req.log.error({ err }, 'failed to send OTP mail')
        return reply.code(502).send({ error: 'Could not send email, try again', code: 'MAIL_FAILED' })
      }
      return reply.send({ ok: true })
    },
  )

  app.post(
    '/auth/otp/verify',
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
    },
    async (req, reply) => {
      const parsed = VerifyInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Enter the 6-digit code', code: 'VALIDATION_ERROR' })
      }
      const userId = req.user!.sub

      const otp = await prisma.emailOtp.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      if (!otp || otp.expiresAt.getTime() < Date.now()) {
        return reply.code(400).send({ error: 'Code expired, request a new one', code: 'OTP_EXPIRED' })
      }
      if (otp.attempts >= MAX_ATTEMPTS) {
        return reply.code(429).send({ error: 'Too many attempts, request a new code', code: 'OTP_LOCKED' })
      }

      const given = Buffer.from(hashCode(userId, parsed.data.code))
      const stored = Buffer.from(otp.codeHash)
      const ok = given.length === stored.length && crypto.timingSafeEqual(given, stored)

      if (!ok) {
        await prisma.emailOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
        return reply.code(400).send({ error: 'Incorrect code', code: 'OTP_INVALID' })
      }

      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } }),
        prisma.emailOtp.deleteMany({ where: { userId } }),
      ])
      return reply.send({ ok: true, emailVerified: true })
    },
  )
}
