# SyncRank

A campus-first competitive programming platform. Merges Codeforces + LeetCode
activity into one Sync Score, ranks students within their campus, and lets
campus admins run local contests with live standings.

This is a monorepo: a typed API + worker backend, and the existing React
frontend now wired to real endpoints for the core flows (auth, dashboard,
leaderboard, contest creation).

## Status

**What's real and working:**
- Full typed API (Fastify + TypeScript) — auth, handles, sync trigger, dashboard,
  campus + global leaderboards, contest CRUD/publish/register/submit/standings,
  admin stats/inactive-list/CSV export, health/ready checks. **Typechecks with
  zero errors.**
- Worker (BullMQ) — sync job processor (CF + LC, with retry/backoff), nightly
  scan, contest lifecycle scheduler (scheduled → live → completed), campus/global
  rank recompute. **Typechecks with zero errors.**
- `packages/shared` — versioned Sync Score pure function with **11 passing unit
  tests**, zod schemas used on every API boundary, shared queue contracts.
- Prisma schema — full data model, indexed for the queries that matter.
  `prisma generate` / `migrate` / `seed` verified end-to-end against Postgres.
- Realtime — Socket.IO with cookie-based auth handshake, campus-scoped room
  joins, Redis pub/sub relay so the worker (a separate process) can push
  contest status changes into live rooms.
- Frontend — `/login`, `/register`, `/dashboard`, `/leaderboards`, `/arena`,
  `/profile`, `/admin`, and `/contests/:id` are fully wired to the live API via
  TanStack Query (real loading/error/empty states). `/admin/contests/new` posts
  to the real contest-creation endpoint. Auth bootstraps from `GET /auth/me` on
  load; protected routes redirect to `/login` when unauthenticated.
- Docker — multi-stage Dockerfiles for api/worker/web, `docker-compose.yml`
  for local/staging parity, `docker-compose.prod.yml` for a managed-DB deploy.
- CI — GitHub Actions: install, typecheck, unit tests, migrate against a real
  Postgres service container, build all packages, smoke-test `/health`.

**What's honestly not done:**
- Mentorship, Recruiters, Sponsored, Developers, Integrations, Teams,
  Tournaments, Mock Interviews, and Practice pages are still visual stubs on
  `mockData.js` and are intentionally out of scope for v1. CreateContestPage
  imports a static problem bank from mockData (content catalog only — not fake
  API data), which is fine.
- No integration test against a real DB beyond the CI smoke test (`/health`,
  `/ready`). Given more time, the next thing worth adding is a Vitest suite
  that spins up against the CI Postgres service and exercises
  register → login → link handle → leaderboard.
  - Password reset endpoints (`POST /auth/forgot-password`, `POST /auth/reset-password`)
  are implemented with hashed one-time tokens. **Email delivery is stubbed** — the
  raw token is logged server-side for local/demo testing until a provider
  (Resend/SES/Postmark) is wired.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the sync flow, live contest flow,
and data model in detail.
