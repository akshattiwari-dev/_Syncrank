import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'
import StaggerGroup, { staggerItemSubtle } from '../components/motion/StaggerGroup.jsx'
import { api } from '../api/client.js'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useCountdown } from '../hooks/useCountdown.js'
import { useContestLiveStandings } from '../hooks/useContestLiveStandings.js'

const DIFF_CLASS = { easy: 'diff-easy', med: 'diff-med', hard: 'diff-hard' }

const STATUS_LABEL = { live: 'Live', scheduled: 'Scheduled', draft: 'Draft', completed: 'Done' }

const rankClass = (rank) => (rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '')

// Common Judge0 language IDs (CE)
const LANGUAGES = [
  { id: 71, label: 'Python 3' },
  { id: 54, label: 'C++ (GCC 9.2)' },
  { id: 50, label: 'C (GCC 9.2)' },
  { id: 62, label: 'Java' },
  { id: 63, label: 'JavaScript (Node)' },
  { id: 60, label: 'Go' },
  { id: 73, label: 'Rust' },
]

const VERDICT_LABEL = {
  accepted: 'Accepted',
  wrong_answer: 'Wrong Answer',
  time_limit: 'Time Limit Exceeded',
  runtime_error: 'Runtime Error',
  compile_error: 'Compilation Error',
  internal_error: 'Internal Error',
  pending: 'Judging…',
}

export default function ContestPage() {
  const { id } = useParams()
  useAuth()
  const queryClient = useQueryClient()
  const [submittingId, setSubmittingId] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [lastVerdict, setLastVerdict] = useState(null) // { problemId, verdict }
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)

  // Per-problem state
  const [codeMap, setCodeMap] = useState({})
  const [langMap, setLangMap] = useState({})

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['contest', id],
    queryFn: () => api.get(`/contests/${id}`),
    enabled: Boolean(id),
  })

  const contest = data?.contest ?? null
  const isLive = contest?.status === 'live'

  const { data: initialStandings } = useQuery({
    queryKey: ['contest-standings', id],
    queryFn: () => api.get(`/contests/${id}/standings`),
    enabled: Boolean(id) && Boolean(contest),
  })

  const { standings: liveStandings, connected, joinError } = useContestLiveStandings(id, {
    enabled: Boolean(contest),
  })

  const standings = liveStandings ?? initialStandings?.standings ?? []

  const remainingSec = useMemo(() => {
    if (!contest?.startAt || !contest?.durationMins) return 0
    const endMs = new Date(contest.startAt).getTime() + contest.durationMins * 60 * 1000
    return Math.max(0, Math.floor((endMs - Date.now()) / 1000))
  }, [contest?.startAt, contest?.durationMins])

  const { label: timerLabel } = useCountdown(remainingSec)

  async function handleSubmit(problemId) {
    const sourceCode = (codeMap[problemId] || '').trim()
    const languageId = langMap[problemId] || 71

    if (!sourceCode) {
      setSubmitError('Write some code before submitting')
      return
    }

    try {
      setSubmittingId(problemId)
      setSubmitError(null)
      setLastVerdict(null)

      const idempotencyKey = crypto.randomUUID()

      const res = await api.post(
        `/contests/${id}/submit`,
        { problemId, sourceCode, languageId },
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )

      queryClient.invalidateQueries({ queryKey: ['contest-standings', id] })
      setRegistered(true)

      if (res?.submission?.verdict) {
        setLastVerdict({ problemId, verdict: res.submission.verdict })
      }
    } catch (err) {
      setSubmitError(err.message || 'Could not submit')
      if (err.code === 'NOT_REGISTERED') setRegistered(false)
      if (err.code === 'NO_TEST_CASES') {
        setSubmitError('This problem has no test cases yet. Ask the contest admin to add them.')
      }
    } finally {
      setSubmittingId(null)
    }
  }

  async function handleRegister() {
    try {
      setRegistering(true)
      setSubmitError(null)
      await api.post(`/contests/${id}/register`)
      setRegistered(true)
      queryClient.invalidateQueries({ queryKey: ['contest', id] })
    } catch (err) {
      setSubmitError(err.message || 'Could not register')
    } finally {
      setRegistering(false)
    }
  }

  if (isLoading) {
    return (
      <section style={{ paddingTop: 40 }}>
        <div className="section-inner--tight section-inner" style={{ color: 'var(--muted)' }}>
          Loading contest…
        </div>
      </section>
    )
  }

  if (isError || !contest) {
    return (
      <section style={{ paddingTop: 40 }}>
        <div className="section-inner--tight section-inner" style={{ color: 'var(--muted)' }}>
          {error?.message || 'Contest not found.'}{' '}
          <Link to="/arena" className="go">
            Back to arena →
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">contest arena</div>
          <div className="contest-problems-head-row">
            <h2 className="sec-title">{contest.title}</h2>
            <span className={`contest-status cs-${contest.status}`}>
              {STATUS_LABEL[contest.status] || contest.status}
            </span>
          </div>
          {contest.description && (
            <p className="sec-sub" style={{ marginTop: 8 }}>
              {contest.description}
            </p>
          )}
        </Reveal>

        <div className="mode-grid" style={{ marginTop: 24 }}>
          <Reveal delay={0.05}>
            <Card className="mode-card live" hover={false}>
              <div className="mode-tag">
                {isLive
                  ? '● Live now'
                  : contest.status === 'scheduled'
                    ? '○ Starts soon'
                    : 'Contest ' + STATUS_LABEL[contest.status]}
              </div>
              <h3>{contest.problems?.length ?? 0} problems</h3>
              <p>
                {contest.durationMins} min ·{' '}
                {contest.scoringMode === 'acm' ? 'ACM penalty scoring' : 'Score-based'}
              </p>
              {remainingSec > 0 && (
                <motion.div
                  className="timer mono"
                  key={timerLabel}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {timerLabel}
                </motion.div>
              )}
              {!registered && (isLive || contest.status === 'scheduled') && (
                <button type="button" className="go" onClick={handleRegister} disabled={registering}>
                  {registering ? '…' : 'Register for this contest'}
                </button>
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="mode-card practice" hover={false}>
              <div className="mode-tag">Live standings</div>
              <h3>{connected ? 'Connected' : 'Connecting…'}</h3>
              <p>
                {joinError
                  ? joinError
                  : 'Standings update in real time as submissions are judged — no need to refresh.'}
              </p>
            </Card>
          </Reveal>
        </div>

        {isLive && (
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--surface-2, #1a1a1a)',
              border: '1px solid var(--border, #333)',
              fontSize: 13,
              color: 'var(--muted)',
            }}
          >
            <strong style={{ color: 'var(--fg)' }}>Real judge:</strong> Code is executed on Judge0.
            Write your solution, pick a language, and submit. Verdict comes from the judge, not from
            you.
          </div>
        )}

        <div className="contest-problems-head-row" style={{ marginTop: 30 }}>
          <h3>Problems</h3>
        </div>

        <Card className="contest-problems" hover={false}>
          {(contest.problems?.length ?? 0) === 0 ? (
            <div className="empty-state">No problems on this contest yet.</div>
          ) : (
            contest.problems
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid var(--border, #333)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span className="mono" style={{ fontWeight: 600 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`diff-dot ${DIFF_CLASS[p.difficulty]}`} />
                    <span style={{ flex: 1 }}>
                      {p.title}{' '}
                      <span className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
                        {p.code}
                      </span>
                    </span>
                    <span className="mono">{p.points} pts</span>
                  </div>

                  {isLive && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select
                          className="mono"
                          value={langMap[p.id] || 71}
                          disabled={submittingId === p.id}
                          onChange={(e) =>
                            setLangMap((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))
                          }
                          style={{ fontSize: 13, padding: '4px 8px' }}
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="go"
                          style={{ fontSize: 13, padding: '6px 14px' }}
                          disabled={submittingId === p.id}
                          onClick={() => handleSubmit(p.id)}
                        >
                          {submittingId === p.id ? 'Judging…' : 'Submit'}
                        </button>

                        {lastVerdict?.problemId === p.id && (
                          <span
                            className="mono"
                            style={{
                              fontSize: 13,
                              color:
                                lastVerdict.verdict === 'accepted'
                                  ? 'var(--green, #22c55e)'
                                  : 'var(--red, #ef4444)',
                            }}
                          >
                            {VERDICT_LABEL[lastVerdict.verdict] || lastVerdict.verdict}
                          </span>
                        )}
                      </div>

                      <textarea
                        className="mono"
                        placeholder="// Write your solution here…"
                        disabled={submittingId === p.id}
                        value={codeMap[p.id] || ''}
                        onChange={(e) =>
                          setCodeMap((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        rows={10}
                        style={{
                          width: '100%',
                          fontSize: 13,
                          padding: 10,
                          borderRadius: 6,
                          border: '1px solid var(--border, #333)',
                          background: 'var(--surface, #111)',
                          color: 'var(--fg)',
                          resize: 'vertical',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      />
                    </div>
                  )}

                  {!isLive && (
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                      Contest is not live — submission disabled.
                    </div>
                  )}
                </div>
              ))
          )}
        </Card>

        {submitError && (
          <div className="form-error" style={{ marginTop: 10 }}>
            {submitError}
          </div>
        )}

        <div className="contest-problems-head-row" style={{ marginTop: 30 }}>
          <h3>Standings</h3>
        </div>

        <Card className="lb-table" hover={false}>
          <div className="lb-head lb-head-sticky">
            <span>#</span>
            <span>Student</span>
            <span>Solved</span>
            <span>{contest.scoringMode === 'acm' ? 'Penalty' : 'Score'}</span>
          </div>

          {standings.length === 0 ? (
            <div className="empty-state">No submissions yet — standings will appear here.</div>
          ) : (
            <StaggerGroup>
              {standings.map((s) => (
                <motion.div className="lb-row" key={s.userId} variants={staggerItemSubtle}>
                  <div className={`lb-rk ${rankClass(s.rank)}`}>{s.rank}</div>
                  <div className="lb-who">
                    <b>{s.userName}</b>
                  </div>
                  <div className="lb-p mono">{s.solved}</div>
                  <div className="lb-score mono">
                    {contest.scoringMode === 'acm' ? s.penaltyMins : s.score}
                  </div>
                </motion.div>
              ))}
            </StaggerGroup>
          )}
        </Card>
      </div>
    </section>
  )
}