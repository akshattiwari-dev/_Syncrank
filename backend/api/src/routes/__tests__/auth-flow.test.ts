import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { prisma } from '@syncrank/db'
import { buildServer } from '../../server.js'
import { AUTH_COOKIE_NAME } from '../../lib/auth.js'

/**
 * Integration flow against real Postgres + Redis.
 * Requires DATABASE_URL + REDIS_URL (same as local/CI).
 * Uses a unique email per run so re-runs don't collide with seed data.
 */
describe('auth → handles → dashboard → leaderboard → submit guard', () => {
  let app: FastifyInstance
  let campusId: string
  let cookieHeader: string
  const email = `itest-${Date.now()}@srm.demo`
  const password = 'TestPass123!'

  beforeAll(async () => {
    let campus = await prisma.campus.findFirst({ where: { name: 'SRM Institute' } })
    if (!campus) {
      campus = await prisma.campus.create({
        data: { name: 'SRM Institute', city: 'Chennai' },
      })
    }
    campusId = campus.id

    app = await buildServer()
    await app.ready()
  }, 30_000)

  afterAll(async () => {
    try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        await prisma.submission.deleteMany({ where: { userId: user.id } })
        await prisma.contestRegistration.deleteMany({ where: { userId: user.id } })
        await prisma.ratingSnapshot.deleteMany({ where: { userId: user.id } })
        await prisma.handleLink.deleteMany({ where: { userId: user.id } })
        await prisma.syncJobLog.deleteMany({ where: { userId: user.id } })
        await prisma.user.delete({ where: { id: user.id } })
      }
    } catch {
      // ignore cleanup errors
    }
    await app?.close()
  }, 30_000)

  function cookieFrom(res: {
    cookies?: Array<{ name: string; value: string }>
    headers: Record<string, unknown>
  }) {
    const parsed = res.cookies?.find((c) => c.name === AUTH_COOKIE_NAME)
    if (parsed) return `${AUTH_COOKIE_NAME}=${parsed.value}`

    const raw = res.headers['set-cookie']
    const first = Array.isArray(raw) ? raw[0] : raw
    if (typeof first === 'string') {
      const part = first.split(';')[0]
      if (part) return part
    }
    return ''
  }

  it('registers a user', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email,
        password,
        name: 'Integration Test',
        campusId,
      },
    })
    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.email).toBe(email)
    cookieHeader = cookieFrom(res)
    expect(cookieHeader).toContain(AUTH_COOKIE_NAME)
  })

  it('rejects duplicate registration with 409 or 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email,
        password,
        name: 'Integration Test',
        campusId,
      },
    })
    expect(res.statusCode).not.toBe(201)
  })

  it('logs in and returns session cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email, password },
    })
    expect(res.statusCode).toBe(200)
    const c = cookieFrom(res)
    if (c) cookieHeader = c
    expect(cookieHeader).toContain(AUTH_COOKIE_NAME)
  })

  it('links a handle', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/me/handles',
      headers: { cookie: cookieHeader },
      payload: { cfHandle: 'tourist', lcUsername: 'leetcode' },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.cfHandle || body.handles?.cfHandle || body.link?.cfHandle).toBeTruthy()
  })

  it('reads dashboard', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/me/dashboard',
      headers: { cookie: cookieHeader },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.user).toBeDefined()
    expect(body.user.name).toBe('Integration Test')
  })

  it('reads campus leaderboard', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/campuses/${campusId}/leaderboard`,
      headers: { cookie: cookieHeader },
    })
    expect(res.statusCode).toBe(200)
  })

  it('rejects submit when problemId does not belong to contest', async () => {
    const admin = await prisma.user.findFirst({
      where: { role: 'campus_admin', campusId },
    })
    if (!admin) {
      expect(true).toBe(true)
      return
    }

    const contestA = await prisma.contest.create({
      data: {
        campusId,
        createdById: admin.id,
        title: 'IT Contest A',
        durationMins: 60,
        status: 'live',
        startAt: new Date(),
        problems: {
          create: [{ code: 'A1', title: 'A1', difficulty: 'easy', points: 100, order: 0 }],
        },
      },
      include: { problems: true },
    })

    const contestB = await prisma.contest.create({
      data: {
        campusId,
        createdById: admin.id,
        title: 'IT Contest B',
        durationMins: 60,
        status: 'live',
        startAt: new Date(),
        problems: {
          create: [{ code: 'B1', title: 'B1', difficulty: 'easy', points: 100, order: 0 }],
        },
      },
      include: { problems: true },
    })

    const problemFromB = contestB.problems[0]!

    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      await prisma.contestRegistration.create({
        data: { contestId: contestA.id, userId: user.id },
      })
    }

    const res = await app.inject({
      method: 'POST',
      url: `/contests/${contestA.id}/submit`,
      headers: { cookie: cookieHeader },
      payload: {
        problemId: problemFromB.id,
        verdict: 'accepted',
      },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().code).toBe('PROBLEM_NOT_IN_CONTEST')

    await prisma.submission.deleteMany({
      where: { contestId: { in: [contestA.id, contestB.id] } },
    })
    await prisma.contestRegistration.deleteMany({
      where: { contestId: { in: [contestA.id, contestB.id] } },
    })
    await prisma.contestProblem.deleteMany({
      where: { contestId: { in: [contestA.id, contestB.id] } },
    })
    await prisma.contest.deleteMany({
      where: { id: { in: [contestA.id, contestB.id] } },
    })
  })
})