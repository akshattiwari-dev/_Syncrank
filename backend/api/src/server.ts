import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'

import { env } from './config/env.js'
import { logger } from './infrastructure/logging/logger.js'
import { redis } from './infrastructure/cache/redis.js'
import authPlugin from './presentation/plugins/auth.js'
import { registerRealtime } from './presentation/realtime/socket.js'

import { healthRoutes } from './presentation/routes/health.js'
import { authRoutes } from './presentation/routes/auth.js'
import { googleAuthRoutes } from './presentation/routes/google-auth.js'
import { meRoutes } from './presentation/routes/me.js'
import { campusRoutes } from './presentation/routes/campuses.js'
import { leaderboardRoutes } from './presentation/routes/leaderboard.js'
import { contestRoutes } from './presentation/routes/contests.js'
import { adminRoutes } from './presentation/routes/admin.js'
import { recruiterRoutes } from './presentation/routes/recruiters.js'
import { developerRoutes } from './presentation/routes/developers.js'
import { tournamentRoutes } from './presentation/routes/tournaments.js'
import { connectionRoutes } from './presentation/routes/connections.js'
import { teamRoutes } from './presentation/routes/teams.js'
import { webhookRoutes } from './presentation/routes/webhooks.js'
import { contactRoutes } from './presentation/routes/contact.js'
import { practiceRoutes } from './presentation/routes/practice.js'

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      redact: ['req.headers.cookie', 'req.headers.authorization'],
      transport:
        env.NODE_ENV === 'production'
          ? undefined
          : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } },
    },
    genReqId: () => randomUUID(),
    trustProxy: true, // behind a reverse proxy (nginx/Cloud LB) in production
  })

  // ---- Security & platform basics ----
  await app.register(helmet, { contentSecurityPolicy: env.NODE_ENV === 'production' })
  await app.register(cors, { origin: env.WEB_ORIGIN, credentials: true })
  await app.register(cookie)
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    redis,
  })
  // Auth and sync routes declare their own tighter `config.rateLimit`
  // (see routes/auth.ts and routes/me.ts) which @fastify/rate-limit reads
  // automatically per-route — no need to double-register the plugin.

  await app.register(authPlugin)

  // ---- Consistent error shape everywhere, no stack traces in prod ----
  app.setErrorHandler((error, req, reply) => {
    req.log.error({ err: error }, 'unhandled error')
    const status = error.statusCode ?? 500
    const body =
      env.NODE_ENV === 'production' && status === 500
        ? { error: 'Internal server error', code: 'INTERNAL_ERROR' }
        : { error: error.message, code: error.code ?? 'ERROR' }
    reply.code(status).send(body)
  })

  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ error: 'Route not found', code: 'NOT_FOUND' })
  })

  // ---- Routes ----
  await app.register(healthRoutes)
  await app.register(authRoutes)
  await app.register(googleAuthRoutes)
  await app.register(meRoutes)
  await app.register(campusRoutes)
  await app.register(leaderboardRoutes)
  await app.register(contestRoutes)
  await app.register(adminRoutes)
  await app.register(recruiterRoutes)
  await app.register(developerRoutes)
  await app.register(tournamentRoutes)
  await app.register(connectionRoutes)
  await app.register(teamRoutes)
  await app.register(webhookRoutes)
  await app.register(contactRoutes)
  await app.register(practiceRoutes)

  // ---- Realtime (Socket.IO mounted on the same HTTP server) ----
  registerRealtime(app)

  return app
}

async function main() {
  const app = await buildServer()

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    logger.info({
      msg: 'SyncRank API listening',
      port: env.PORT,
      env: env.NODE_ENV,
      fixtureMode: env.FIXTURE_MODE,
    })
  } catch (err) {
    logger.error({ msg: 'Failed to start server', err })
    process.exit(1)
  }

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, async () => {
      logger.info({ msg: `${signal} received, shutting down gracefully` })
      await app.close()
      process.exit(0)
    })
  }
}

// Only listen when this file is the process entrypoint (not when imported by tests)
const isDirectRun =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  main()
}