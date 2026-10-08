import type { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@syncrank/db'
import { sendOtpMail } from '../../infrastructure/mail/mailer.js'
import {
  signAuthToken,
  AUTH_COOKIE_NAME,
  authCookieOptions,
} from '../../infrastructure/auth/auth.js'

const OTP_TTL_MS = 10 * 60 * 1000
const COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

const hashCode = (userId: string, code: string) =>
  crypto.createHash('sha256').update(`${userId}:${code}`).digest('hex')

const SendInput = z.object({ email: z.string().email() })
const VerifyInput = z.object({ email: z.string().email(), code: z.string().regex(/^\d{6}$/) })

export async function emailOtpLoginRoutes(app: FastifyInstance) {
  app.post(
    '/auth/otp/login/send',
    { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } },
    async (req, reply) => {
      const parsed = SendInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Enter a valid email', code: 'VALIDATION_ERROR' })
      }
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })

      if (user) {
        const last = await prisma.emailOtp.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        })
        const inCooldown = last && Date.now() - last.createdAt.getTime() < COOLDOWN_MS
        if (!inCooldown) {
          const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
          await prisma.emailOtp.deleteMany({ where: { userId: user.id } })
          await prisma.emailOtp.create({
            data: {
              userId: user.id,
              codeHash: hashCode(user.id, code),
              expiresAt: new Date(Date.now() + OTP_TTL_MS),
            },
          })
          try {
            await sendOtpMail(user.email, code)
          } catch (err) {
            req.log.error({ err }, 'failed to send login OTP mail')
          }
        }
      }
      // Same response whether or not the email exists
      return reply.send({ ok: true })
    },
  )

  app.post(
    '/auth/otp/login/verify',
    { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } },
    async (req, reply) => {
      const parsed = VerifyInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Enter email and 6-digit code', code: 'VALIDATION_ERROR' })
      }
      const { email, code } = parsed.data
      const invalid = () =>
        reply.code(400).send({ error: 'Incorrect or expired code', code: 'OTP_INVALID' })

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return invalid()

      const otp = await prisma.emailOtp.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      })
      if (!otp || otp.expiresAt.getTime() < Date.now()) return invalid()
      if (otp.attempts >= MAX_ATTEMPTS) {
        return reply.code(429).send({ error: 'Too many attempts, request a new code', code: 'OTP_LOCKED' })
      }

      const given = Buffer.from(hashCode(user.id, code))
      const stored = Buffer.from(otp.codeHash)
      const ok = given.length === stored.length && crypto.timingSafeEqual(given, stored)
      if (!ok) {
        await prisma.emailOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
        return invalid()
      }

      await prisma.$transaction([
        prisma.emailOtp.deleteMany({ where: { userId: user.id } }),
        ...(user.emailVerifiedAt
          ? []
          : [prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } })]),
      ])

      const token = signAuthToken({
        sub: user.id,
        role: user.role,
        campusId: user.campusId,
        tokenVersion: user.tokenVersion,
      })
      reply.setCookie(AUTH_COOKIE_NAME, token, authCookieOptions)
      return reply.send({ ok: true })
    },
  )
}
