# Architecture

## Overview

Three deployable units, one shared type/schema layer:

```
frontend/web  ──HTTP+cookies──▶  backend/api  ──enqueues──▶  Redis (BullMQ)  ◀──consumes── backend/worker
   │                             │                                                       │
   │◀──────────WebSocket─────────┤                                                       │
   │      (Socket.IO, same                                                               │
   │       process as api)                                                               │
   │                             │                                                       │
   │                             ▼                                                       ▼
   │                        PostgreSQL ◀─────────────────────────────────────────────────┘
   │                     (via packages/db,
   │                      one generated Prisma
   │                      client, two consumers)
   │
   └─ Redis pub/sub: worker publishes contest status changes to a channel;
      api subscribes and relays into the matching Socket.IO room. This is
      the only channel through which the worker (a separate OS process)
      reaches a browser — it never talks to sockets directly.
```

`packages/shared` sits underneath all three: zod schemas validated at every
API boundary, the versioned Sync Score pure function (tested, documented),
and the BullMQ queue name/payload contracts both api (producer) and worker
(consumer) import from — so a payload shape change is a compile error in
both places, not a runtime surprise.

`packages/db` holds the Prisma schema once. Both api and worker depend on it
and get the same generated client — there is exactly one source of truth for
the data model, never two copies drifting apart.

## Sync flow

1. Student links a CF handle and/or LC username via `POST /me/handles`.
2. The API writes the `HandleLink` row and enqueues a `sync-user` BullMQ job
   for that user (`enqueueUserSync`) — it does not fetch anything itself.
   The API never makes outbound calls to Codeforces/LeetCode; only the
   worker does. This keeps the API's request/response cycle fast and keeps
   all rate-limit-sensitive external calls in one place.
3. The worker's sync processor (`processSyncJob`) pulls CF and LC data
   independently — one platform failing doesn't block the other. CF uses a
   dedicated client with process-wide throttling (`CF_REQUEST_DELAY_MS`
   between calls) and exponential backoff on retryable errors (rate limits,
   5xx). LC has no stable public API, so it's best-effort: real GraphQL call
   first, deterministic fixture data on any failure (or always, if
   `FIXTURE_MODE=true`).
4. The versioned `computeSyncScore()` function turns whatever data came back
   into a score. It's designed so partial data (only one platform linked, or
   one platform's fetch failed this run) degrades gracefully rather than
   erroring — see the pure function's own docstring and tests for the exact
   edge-case behavior.
5. A new `RatingSnapshot` row is appended (snapshots are an intentional time
   series, not an update-in-place — this is what powers profile growth
   charts and lets you re-derive historical rank at any point).
6. `HandleLink.lastSyncedAt` / `isStale` / `lastError` are updated. A
   `SyncJobLog` row records the attempt (status, error, a size-capped copy
   of the raw CF payload for debugging).
7. Campus (and global) ranks are recomputed in a batch — after the nightly
   scan finishes for everyone, not after every individual sync, since
   re-ranking a whole campus on every single user's sync would be wasteful
   and produce noisy rank churn.

The nightly job is a BullMQ **repeatable** job (`0 2 * * *`), registered
once in the worker's `main.ts` with a fixed `jobId` so redeploying the
worker doesn't stack duplicate schedules. It doesn't sync anyone directly —
it enumerates every `HandleLink` and enqueues the exact same per-user job
that "Sync now" enqueues, so there is only one code path for "how does a
sync happen," exercised by both triggers.

## Live contest flow

1. Admin creates a contest (`POST /contests`, status `draft`) with a
   problem list built in the frontend's contest builder.
2. Admin publishes (`POST /contests/:id/publish`). The API validates there's
   at least one problem and a start time, then sets status to `scheduled`
   (or straight to `live` if the start time is already in the past — an
   ad-hoc contest).
3. The worker polls every `CONTEST_LIFECYCLE_POLL_MS` (default 30s) for
   contests whose `startAt` has passed while still `scheduled`, and for
   `live` contests whose `startAt + durationMins` has passed. It enqueues a
   `contest-lifecycle` job for each transition needed.
   Polling rather than precise delayed-jobs-per-contest was a deliberate
   choice: it's simpler, and it's self-healing — if the worker was down
   when a contest should have started, the very next poll catches it. A
   delayed job scheduled at creation time and then lost on a worker restart
   would silently never fire.
4. The lifecycle processor flips `Contest.status` in the DB, then publishes
   a message on the `syncrank:contest-events` Redis channel. The API (which
   owns the actual Socket.IO server, since sockets live in the same process
   that accepted the HTTP upgrade) is subscribed to that channel and relays
   the message into the `contest:{id}` room.
5. Students register (`POST /contests/:id/register`) and, once live, submit
   (`POST /contests/:id/submit`). Submission is server-authoritative:
   the client sends a problem + verdict, the API records it and immediately
   recomputes standings for that contest (`computeStandings`), then
   broadcasts the new standings directly into the room — no round-trip
   through the worker needed here, since the API already has the live
   Socket.IO instance and the submission happened in-process.
6. `computeStandings` is a pure read over `Submission` rows — nothing about
   standings is stored denormalized, so it's always correct relative to the
   submission log, and safe to call as often as needed. ACM mode ranks by
   (solved desc, penalty asc); score mode ranks by total points with a
   partial-credit penalty for wrong attempts before an eventual AC.
7. Frontend joins a room via `useContestLiveStandings(contestId)`, which
   authenticates the socket with the same httpOnly cookie the REST calls
   use (no separate token to manage) and listens for both `standings:update`
   (submission-triggered) and `contest:event` (worker-triggered status
   change) messages.

## Why these specific tradeoffs

- **Fastify over NestJS**: fewer abstractions for a service this size: 8
  route files, no need for DI containers or decorators to stay organized.
- **Socket.IO over raw WebSocket/SSE**: automatic reconnection and room
  primitives (`socket.join`/`.to(room)`) map directly onto "N people watching
  one contest" without hand-rolling connection bookkeeping.
- **BullMQ over a hand-rolled queue**: retry/backoff, repeatable jobs, and
  job dedup (via `jobId`) are exactly the primitives this system needs, and
  BullMQ gives them for free on top of Redis, which is already a dependency
  for rate limiting and pub/sub.
- **Snapshots, not a single mutable "current score" column**: campus growth
  charts, "how has this student's rank moved," and re-deriving historical
  standings all need history. Storing only the latest value would have made
  those either impossible or required a separate history table anyway —
  might as well make the history table the source of truth from the start.
- **Worker never touches the API's Socket.IO instance directly, only via
  Redis pub/sub**: this is what lets the API be horizontally scaled later
  (multiple API instances, each subscribed to the same channel, each with
  its own subset of connected sockets) without the worker needing to know
  how many API instances exist or which one a given browser is connected to.

## Known limitations / what to harden next

- Standings are recomputed by scanning all submissions for a contest on
  every request/broadcast. Fine at demo/pilot scale (one campus, one
  contest, tens of participants); would need incremental recomputation or
  caching before it's fine at hundreds of concurrent submitters.
- No idempotency key on `POST /contests/:id/submit` — a network retry from
  the client could record a duplicate submission. Low risk for a
  controlled-demo submit endpoint, but worth adding before this handles
  real judge callbacks.
- `packages/db`'s Prisma client generation was not verified against a live
  network in the environment this was built in (see README's "Status"
  section) — the schema is correct by careful hand-review, not by having
  actually run `prisma generate`/`migrate` successfully yet.
