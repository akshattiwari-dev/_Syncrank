import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client.js'
import { useAuth } from '../auth/AuthProvider.jsx'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'
import { useCountdown } from '../hooks/useCountdown.js'

const STATUS_LABEL = {
  live: 'Live',
  scheduled: 'Scheduled',
  draft: 'Draft',
  completed: 'Done',
}

export default function ArenaPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [registeringId, setRegisteringId] = useState(null)
  const [registerError, setRegisterError] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contests'],
    queryFn: () => api.get('/contests'),
  })

  const contests = data?.contests ?? []

  const featured =
    contests.find((c) => c.status === 'live') ||
    contests.find((c) => c.status === 'scheduled') ||
    null

  const remainingSec = (() => {
    if (!featured?.startAt || !featured?.durationMins) return 0
    const endMs =
      new Date(featured.startAt).getTime() +
      featured.durationMins * 60 * 1000
    return Math.max(0, Math.floor((endMs - Date.now()) / 1000))
  })()

  const { label: timerLabel } = useCountdown(remainingSec)

  async function handleRegister(contestId) {
    try {
      setRegisterError(null)
      setRegisteringId(contestId)
      await api.post(`/contests/${contestId}/register`)
      queryClient.invalidateQueries({ queryKey: ['contests'] })
      navigate(`/contests/${contestId}`)
    } catch (err) {
      setRegisterError(err.message || 'Could not register')
    } finally {
      setRegisteringId(null)
    }
  }

  if (isLoading) {
    return (
      <section style={{ paddingTop: 40 }}>
        <div className="section-inner--tight section-inner" style={{ color: 'var(--muted)' }}>
          Loading contests…
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section style={{ paddingTop: 40 }}>
        <div className="section-inner--tight section-inner" style={{ color: 'var(--muted)' }}>
          Could not load contests.
        </div>
      </section>
    )
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">contest arena</div>
          <h2 className="sec-title">Practice, or compete for real</h2>
        </Reveal>

        {registerError && (
          <div
            role="alert"
            style={{
              marginTop: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'color-mix(in srgb, var(--danger, #e11) 12%, transparent)',
              color: 'var(--danger, #e11)',
              fontSize: 14,
            }}
          >
            {registerError}
          </div>
        )}

        <div className="mode-grid" style={{ marginTop: 30 }}>
          <Reveal delay={0.05}>
            <Card className="mode-card practice">
              <div className="mode-tag">Daily Practice</div>
              <h3>No pressure, just reps</h3>
              <p>
                Fresh problems every day, pulled from Codeforces and LeetCode, matched to your weak
                topics. No timer, no standings.
              </p>
              <Link to="/practice" className="go">
                Start practicing
              </Link>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="mode-card live">
              <div className="mode-tag">
                {featured?.status === 'live'
                  ? '● Live Campus Contest'
                  : featured?.status === 'scheduled'
                    ? '○ Scheduled Contest'
                    : 'No contest'}
              </div>
              <h3>{featured?.title || 'No upcoming contest'}</h3>
              <p>
                {featured
                  ? `${featured.problems?.length ?? 0} problems · ${featured.durationMins} min`
                  : 'Create or wait for a campus contest.'}
              </p>
              <motion.div
                className="timer mono"
                key={timerLabel}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {timerLabel}
              </motion.div>
              {featured &&
              (featured.status === 'live' || featured.status === 'scheduled') ? (
                <Link to={`/contests/${featured.id}`} className="go">
                  Enter arena
                </Link>
              ) : (
                <div className="go" style={{ opacity: 0.5 }}>
                  No live contest
                </div>
              )}
            </Card>
          </Reveal>
        </div>

        <div className="contest-problems-head-row" style={{ marginTop: 30 }}>
          <h3>Campus contests</h3>
          {user?.role === 'campus_admin' && (
            <Link to="/admin/contests/new" className="contest-solved-tag mono">
              + create one →
            </Link>
          )}
        </div>

        <Card className="performers" hover={false}>
          {contests.length === 0 ? (
            <div className="empty-state">No contests scheduled yet.</div>
          ) : (
            contests.map((c) => (
              <div className="contest-list-row" key={c.id}>
                <span className={`contest-status cs-${c.status}`}>
                  {STATUS_LABEL[c.status] || c.status}
                </span>
                <div>
                  {c.status === 'draft' ? (
                    <h5>{c.title}</h5>
                  ) : (
                    <Link to={`/contests/${c.id}`}>
                      <h5>{c.title}</h5>
                    </Link>
                  )}
                  <p>
                    {c.problems?.length ?? 0} problems · {c.durationMins}min
                  </p>
                </div>
                <span className="contest-list-meta mono">
                  {c.startAt ? new Date(c.startAt).toLocaleString() : 'not scheduled'}
                </span>
                <span className="contest-list-meta mono">
                  {c._count?.registrations != null
                    ? `${c._count.registrations} joined`
                    : '—'}
                </span>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                  disabled={
                    registeringId === c.id ||
                    c.status === 'draft' ||
                    c.status === 'completed'
                  }
                  onClick={() => handleRegister(c.id)}
                >
                  {registeringId === c.id
                    ? '…'
                    : c.status === 'completed'
                      ? 'Ended'
                      : 'Register'}
                </button>
              </div>
            ))
          )}
        </Card>
      </div>
    </section>
  )
}