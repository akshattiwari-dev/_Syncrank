import type { FastifyInstance } from 'fastify'
import { randomBytes } from 'node:crypto'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@syncrank/db'
import { env } from '../lib/env.js'
import { signAuthToken, AUTH_COOKIE_NAME, authCookieOptions } from '../lib/auth.js'
import { logger } from '../lib/logger.js'

function googleConfigured() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI)
}

function getClient() {
  return new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  )
}

function encodeState(payload: { campusId?: string; n: string }) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function decodeState(state: string): { campusId?: string; n: string } | null {
  try {
    const raw = Buffer.from(state, 'base64url').toString('utf8')
    const parsed = JSON.parse(raw) as { campusId?: string; n: string }
    if (!parsed || typeof parsed.n !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export async function googleAuthRoutes(app: FastifyInstance) {
  app.get('/auth/google', async (req, reply) => {
    if (!googleConfigured()) {
      return reply.code(503).send({
        error: 'Google sign-in is not configured',
        code: 'GOOGLE_NOT_CONFIGURED',
      })
    }

    const q = req.query as { campusId?: string }
    const state = encodeState({
      campusId: q.campusId,
      n: randomBytes(16).toString('hex'),
    })

    const client = getClient()
    const url = client.generateAuthUrl({
      access_type: 'online',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
    })

    return reply.redirect(url)
  })

  app.get('/auth/google/callback', async (req, reply) => {
    if (!googleConfigured()) {
      return reply.redirect(`${env.WEB_ORIGIN}/login?error=google_not_configured`)
    }

    const q = req.query as { code?: string; state?: string; error?: string }
    if (q.error || !q.code) {
      return reply.redirect(`${env.WEB_ORIGIN}/login?error=google_denied`)
    }

    const state = q.state ? decodeState(q.state) : null
    const client = getClient()

    try {
      const { tokens } = await client.getToken(q.code)
      if (!tokens.id_token) {
        return reply.redirect(`${env.WEB_ORIGIN}/login?error=google_failed`)
      }

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      if (!payload?.sub || !payload.email) {
        return reply.redirect(`${env.WEB_ORIGIN}/login?error=google_no_email`)
      }

      const googleId = payload.sub
      const email = payload.email
      const name = payload.name ?? email.split('@')[0] ?? 'Google User'

      let user = await prisma.user.findUnique({ where: { googleId } })

      if (!user) {
        user = await prisma.user.findUnique({ where: { email } })
        if (user) {
          // Link Google + mark email verified (Google already proved ownership)
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
            },
          })
        }
      }

      if (!user) {
        const campusId = state?.campusId
        if (!campusId) {
          return reply.redirect(
            `${env.WEB_ORIGIN}/register?error=campus_required&google=1`,
          )
        }
        const campus = await prisma.campus.findUnique({ where: { id: campusId } })
        if (!campus) {
          return reply.redirect(`${env.WEB_ORIGIN}/register?error=invalid_campus`)
        }

        user = await prisma.user.create({
          data: {
            email,
            name,
            googleId,
            campusId,
            role: 'student',
            passwordHash: null,
            emailVerifiedAt: new Date(),
          },
        })
      }

      const token = signAuthToken({
        sub: user.id,
        role: user.role,
        campusId: user.campusId,
        tokenVersion: user.tokenVersion,
      })
      reply.setCookie(AUTH_COOKIE_NAME, token, authCookieOptions)
      return reply.redirect(`${env.WEB_ORIGIN}/dashboard`)
    } catch (err) {
      logger.error({ msg: 'Google OAuth callback failed', err })
      return reply.redirect(`${env.WEB_ORIGIN}/login?error=google_failed`)
    }
  })
}