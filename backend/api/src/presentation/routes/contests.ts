import type { FastifyInstance } from 'fastify'
import { prisma } from '@syncrank/db'
import { computeStandings, invalidateStandingsCache } from '../../application/services/standings.service.js'
import { broadcastStandings } from '../realtime/socket.js'
import {
  CreateContestInput,
  UpdateContestInput,
  SubmitInput,
  InviteUsersInput,
} from '@syncrank/shared'
import {
  createSubmission,
  waitForResult,
  mapJudge0Status,
} from '../../infrastructure/judge/judge0.js'

export async function contestRoutes(app: FastifyInstance) {
  app.get('/contests', { preHandler: app.requireAuth }, async (req, reply) => {
    const contests = await prisma.contest.findMany({
      where: { OR: [{ campusId: req.user!.campusId }, { visibility: 'public' }] },
      orderBy: [{ status: 'asc' }, { startAt: 'asc' }],
      include: { problems: true, _count: { select: { registrations: true } } },
    })
    return reply.send({ contests })
  })

  app.post(
    '/contests',
    {
      preHandler: app.requireRole('campus_admin'),
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const parsed = CreateContestInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid input',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }
      const input = parsed.data

      const contest = await prisma.contest.create({
        data: {
          campusId: req.user!.campusId,
          createdById: req.user!.sub,
          title: input.title,
          description: input.description,
          startAt: new Date(input.startAt),
          durationMins: input.durationMins,
          visibility: input.visibility,
          scoringMode: input.scoringMode,
          participantsMode: input.participantsMode,
          status: 'draft',
          problems: {
            create: input.problems.map((p) => ({
              code: p.code,
              title: p.title,
              difficulty: p.difficulty,
              points: p.points,
              order: p.order,
            })),
          },
        },
        include: { problems: true },
      })

      return reply.code(201).send({ contest })
    },
  )

  app.get('/contests/:id', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        problems: { orderBy: { order: 'asc' } },
        _count: { select: { registrations: true } },
      },
    })
    if (!contest) return reply.code(404).send({ error: 'Contest not found', code: 'NOT_FOUND' })
    if (contest.visibility === 'campus' && contest.campusId !== req.user!.campusId) {
      return reply.code(403).send({ error: 'Not authorized for this contest', code: 'FORBIDDEN' })
    }
    return reply.send({ contest })
  })

  app.patch(
    '/contests/:id',
    {
      preHandler: app.requireRole('campus_admin'),
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string }
      const parsed = UpdateContestInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid input',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }

      const existing = await prisma.contest.findUnique({ where: { id } })
      if (!existing) return reply.code(404).send({ error: 'Contest not found', code: 'NOT_FOUND' })
      if (existing.createdById !== req.user!.sub) {
        return reply.code(403).send({ error: 'Only the creator can edit this contest', code: 'FORBIDDEN' })
      }
      if (existing.status !== 'draft') {
        return reply.code(409).send({ error: 'Only draft contests can be edited', code: 'NOT_EDITABLE' })
      }

      const { problems, startAt, ...rest } = parsed.data

      const contest = await prisma.contest.update({
        where: { id },
        data: {
          ...rest,
          ...(startAt ? { startAt: new Date(startAt) } : {}),
          ...(problems
            ? {
                problems: {
                  deleteMany: {},
                  create: problems.map((p) => ({
                    code: p.code,
                    title: p.title,
                    difficulty: p.difficulty,
                    points: p.points,
                    order: p.order,
                  })),
                },
              }
            : {}),
        },
        include: { problems: true },
      })

      return reply.send({ contest })
    },
  )

  app.post('/contests/:id/publish', { preHandler: app.requireRole('campus_admin') }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const existing = await prisma.contest.findUnique({
      where: { id },
      include: { problems: true },
    })
    if (!existing) return reply.code(404).send({ error: 'Contest not found', code: 'NOT_FOUND' })
    if (existing.createdById !== req.user!.sub) {
      return reply.code(403).send({ error: 'Only the creator can publish this contest', code: 'FORBIDDEN' })
    }
    if (existing.problems.length === 0) {
      return reply.code(400).send({
        error: 'Add at least one problem before publishing',
        code: 'NO_PROBLEMS',
      })
    }
    if (!existing.startAt) {
      return reply.code(400).send({
        error: 'Set a start time before publishing',
        code: 'NO_START_TIME',
      })
    }

    const status = existing.startAt.getTime() <= Date.now() ? 'live' : 'scheduled'
    const contest = await prisma.contest.update({ where: { id }, data: { status } })
    return reply.send({ contest })
  })

  app.post(
    '/contests/:id/register',
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string }
      const contest = await prisma.contest.findUnique({ where: { id } })
      if (!contest) return reply.code(404).send({ error: 'Contest not found', code: 'NOT_FOUND' })
      if (contest.status === 'completed') {
        return reply.code(409).send({
          error: 'This contest has already ended',
          code: 'CONTEST_ENDED',
        })
      }
      if (contest.visibility === 'campus' && contest.campusId !== req.user!.campusId) {
        return reply.code(403).send({ error: 'Not authorized for this contest', code: 'FORBIDDEN' })
      }

      if (contest.participantsMode === 'invite') {
        const invited = await prisma.contestInvite.findUnique({
          where: {
            contestId_userId: { contestId: id, userId: req.user!.sub },
          },
        })
        if (!invited) {
          return reply.code(403).send({
            error: 'This contest is invite-only',
            code: 'NOT_INVITED',
          })
        }
      }

      const registration = await prisma.contestRegistration.upsert({
        where: { contestId_userId: { contestId: id, userId: req.user!.sub } },
        update: {},
        create: { contestId: id, userId: req.user!.sub },
      })

      return reply.code(201).send({ registration })
    },
  )

  app.post(
    '/contests/:id/invites',
    {
      preHandler: app.requireRole('campus_admin'),
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const { id } = req.params as { id: string }
      const parsed = InviteUsersInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid input',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }

      const contest = await prisma.contest.findUnique({ where: { id } })
      if (!contest) {
        return reply.code(404).send({ error: 'Contest not found', code: 'NOT_FOUND' })
      }
      if (contest.campusId !== req.user!.campusId) {
        return reply.code(403).send({ error: 'Forbidden', code: 'FORBIDDEN' })
      }

      await prisma.contestInvite.createMany({
        data: parsed.data.userIds.map((userId) => ({
          contestId: id,
          userId,
        })),
        skipDuplicates: true,
      })

      return reply.code(201).send({ ok: true, invited: parsed.data.userIds.length })
    },
  )

  // ---------- SUBMIT (real Judge0) ----------
  app.post(
    '/contests/:id/submit',
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 15, timeWindow: '1 minute' } }, // lower because Judge0 is slow
    },
    async (req, reply) => {
      const { id } = req.params as { id: string }
      const parsed = SubmitInput.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Invalid input',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        })
      }
      const { problemId, sourceCode, languageId } = parsed.data

      const contest = await prisma.contest.findUnique({ where: { id } })
      if (!contest) {
        return reply.code(404).send({ error: 'Contest not found', code: 'NOT_FOUND' })
      }
      if (contest.status !== 'live') {
        return reply.code(409).send({
          error: 'Contest is not currently live',
          code: 'CONTEST_NOT_LIVE',
        })
      }

      const problem = await prisma.contestProblem.findUnique({
        where: { id: problemId },
        include: { testCases: { orderBy: { order: 'asc' } } },
      })
      if (!problem || problem.contestId !== id) {
        return reply.code(400).send({
          error: 'This problem does not belong to this contest',
          code: 'PROBLEM_NOT_IN_CONTEST',
        })
      }

      const registered = await prisma.contestRegistration.findUnique({
        where: { contestId_userId: { contestId: id, userId: req.user!.sub } },
      })
      if (!registered) {
        return reply.code(403).send({
          error: 'Register for this contest before submitting',
          code: 'NOT_REGISTERED',
        })
      }

      // Require at least one test case for real judging
      if (!problem.testCases || problem.testCases.length === 0) {
        return reply.code(400).send({
          error: 'This problem has no test cases configured yet. Ask the admin to add them.',
          code: 'NO_TEST_CASES',
        })
      }

      const idempotencyKey =
        (req.headers['idempotency-key'] as string | undefined)?.trim() || undefined

      if (idempotencyKey) {
        const existing = await prisma.submission.findUnique({
          where: { idempotencyKey },
        })
        if (existing) {
          const standings = await computeStandings(id)
          return reply.send({ submission: existing, standings, idempotent: true })
        }
      }

      // Create a pending submission first
      let submission
      try {
        submission = await prisma.submission.create({
          data: {
            contestId: id,
            problemId,
            userId: req.user!.sub,
            verdict: 'pending',
            sourceCode,
            languageId,
            ...(idempotencyKey ? { idempotencyKey } : {}),
          },
        })
      } catch (err: unknown) {
        const code =
          typeof err === 'object' && err && 'code' in err
            ? (err as { code?: string }).code
            : undefined
        if (idempotencyKey && code === 'P2002') {
          const existing = await prisma.submission.findUnique({
            where: { idempotencyKey },
          })
          if (existing) {
            const standings = await computeStandings(id)
            return reply.send({ submission: existing, standings, idempotent: true })
          }
        }
        throw err
      }

      // Run against test cases (stop on first failure)
      let finalVerdict:
        | 'accepted'
        | 'wrong_answer'
        | 'time_limit'
        | 'runtime_error'
        | 'compile_error'
        | 'internal_error' = 'accepted'
      let runtimeMs: number | null = null
      let memoryKb: number | null = null
      let failedTestCase: number | null = null
      let judgeToken: string | null = null

      try {
        for (let i = 0; i < problem.testCases.length; i++) {
          const tc = problem.testCases[i]

          const { token } = await createSubmission({
            sourceCode,
            languageId,
            stdin: tc.input,
            expectedOutput: tc.expectedOut,
            cpuTimeLimit: (problem.timeLimitMs || 2000) / 1000,
            memoryLimit: problem.memoryLimitKb || 256000,
          })

          judgeToken = token
          const result = await waitForResult(token, { maxAttempts: 25, intervalMs: 800 })

          const statusId = result.status?.id ?? 13
          const mapped = mapJudge0Status(statusId)

          // Track max runtime / memory
          if (result.time) {
            const ms = Math.round(parseFloat(result.time) * 1000)
            runtimeMs = runtimeMs == null ? ms : Math.max(runtimeMs, ms)
          }
          if (result.memory != null) {
            memoryKb = memoryKb == null ? result.memory : Math.max(memoryKb, result.memory)
          }

          if (mapped === 'pending') {
            // waitForResult() polls until a terminal status or throws on
            // timeout, so this branch should be unreachable in practice —
            // but Judge0's status codes aren't a contract we control, so
            // fail safe instead of trusting that invariant blindly.
            finalVerdict = 'internal_error'
            failedTestCase = i + 1
            break
          }

          if (mapped !== 'accepted') {
            finalVerdict = mapped
            failedTestCase = i + 1 // 1-based
            break
          }
        }
      } catch (err) {
        console.error('[judge0] error', err)
        finalVerdict = 'internal_error'
      }

      // Update the submission with final result
      submission = await prisma.submission.update({
        where: { id: submission.id },
        data: {
          verdict: finalVerdict,
          runtimeMs,
          memoryKb,
          failedTestCase,
          judgeToken,
        },
      })

      await invalidateStandingsCache(id)
      const standings = await computeStandings(id)
      broadcastStandings(id, standings)

      return reply.code(201).send({ submission, standings })
    },
  )

  app.get('/contests/:id/standings', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const contest = await prisma.contest.findUnique({ where: { id } })
    if (!contest) {
      return reply.code(404).send({ error: 'Contest not found', code: 'NOT_FOUND' })
    }

    const standings = await computeStandings(id)
    return reply.send({ standings })
  })
}