import { useAuth } from '../../auth/AuthProvider.jsx'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../shared/api/client.js'
import { motion } from 'framer-motion'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import StaggerGroup, { staggerItem } from '../../../shared/components/motion/StaggerGroup.jsx'

const STATUS_LABEL = {
  live: 'Live',
  scheduled: 'Scheduled',
  draft: 'Draft',
  completed: 'Done',
}

export default function AdminPage() {
  const { user } = useAuth()

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats'),
  })

  const {
    data: inactiveData,
    isLoading: inactiveLoading,
  } = useQuery({
    queryKey: ['admin-inactive'],
    queryFn: () => api.get('/admin/inactive'),
  })

  const {
    data: contestsData,
    isLoading: contestsLoading,
  } = useQuery({
    queryKey: ['admin-contests'],
    queryFn: () => api.get('/admin/contests'),
  })

  const { data: leaderboardData } = useQuery({
    queryKey: ['admin-top-performers', user?.campus?.id],
    queryFn: () =>
      api.get(`/campuses/${user.campus.id}/leaderboard?page=1&pageSize=5`),
    enabled: Boolean(user?.campus?.id),
  })

  if (statsLoading) {
    return (
      <section style={{ paddingTop: 40 }}>
        <div className="section-inner" style={{ color: 'var(--muted)' }}>
          Loading admin…
        </div>
      </section>
    )
  }

  if (statsError || !stats) {
    return (
      <section style={{ paddingTop: 40 }}>
        <div className="section-inner" style={{ color: 'var(--muted)' }}>
          Could not load admin stats.
        </div>
      </section>
    )
  }

  // Step 4: API se sirf rows array nikaalo
  const contests = contestsData?.contests ?? []
  const inactiveRows = inactiveData?.rows ?? []
  const topPerformers = leaderboardData?.rows ?? []

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <div className="admin-head-row">
          <Reveal>
            <div className="eyebrow-quiet">campus admin</div>
            <h2 className="sec-title">Campus — growth overview</h2>
          </Reveal>
          <Reveal delay={0.03}>
            <Link to="/admin/contests/new" className="btn-primary">
              + Create contest
            </Link>
          </Reveal>
        </div>

        <StaggerGroup className="admin-stats" style={{ marginTop: 22 }}>
          <motion.div variants={staggerItem}>
            <Card className="admin-stat">
              <div className="v">{stats.studentsTotal ?? '—'}</div>
              <div className="l">students synced</div>
            </Card>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Card className="admin-stat">
              <div className="v" style={{ color: 'var(--sage)' }}>
                —
              </div>
              <div className="l">rating growth this week</div>
            </Card>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Card className="admin-stat">
              <div className="v">{stats.activeLast24h ?? '—'}</div>
              <div className="l">active in last 24h</div>
            </Card>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Card className="admin-stat">
              <div className="v" style={{ color: 'var(--rust)' }}>
                {stats.inactive14d ?? '—'}
              </div>
              <div className="l">inactive 14+ days</div>
            </Card>
          </motion.div>
        </StaggerGroup>

        <Reveal delay={0.06}>
          <Card className="performers" style={{ marginTop: 16 }}>
            <h3>Your contests</h3>
            {contestsLoading ? (
              <div className="empty-state">Loading contests…</div>
            ) : contests.length === 0 ? (
              <div className="empty-state">No contests yet — create your first one.</div>
            ) : (
              <div>
                {contests.map((c) => (
                  <div className="contest-list-row" key={c.id}>
                    <span className={`contest-status cs-${c.status}`}>
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                    <div>
                      <h5>{c.title}</h5>
                      <p>
                        {c.problems?.length ?? 0} problems · {c.durationMins}min ·{' '}
                        {c.visibility === 'public' ? 'public link' : 'campus only'}
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
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Reveal>

        <div className="admin-grid" style={{ marginTop: 16 }}>
          <Reveal delay={0.08}>
            <Card className="performers">
              <h3>Top performers</h3>
              <div>
                {topPerformers.length === 0 ? (
                  <div className="empty-state">No leaderboard data yet.</div>
                ) : (
                  topPerformers.map((s, i) => (
                    <div className="perf-row" key={s.id || i}>
                      <span>
                        {s.rank ?? i + 1}. {s.name}
                      </span>
                      <span className="v mono">{s.syncScore ?? '—'}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="alerts">
              <h3>Inactive students</h3>
              <div>
                {inactiveLoading ? (
                  <div className="empty-state">Loading…</div>
                ) : inactiveRows.length === 0 ? (
                  <div className="empty-state">No inactive students.</div>
                ) : (
                  inactiveRows.map((s) => (
                    <div className="alert-row" key={s.id}>
                      <span>{s.name}</span>
                      <span>
                        {s.daysInactive == null
                          ? 'never synced'
                          : `${s.daysInactive}d inactive`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={0.14}>
          <Card className="performers" style={{ marginTop: 16 }}>
            <h3>Placement analytics</h3>
            <div className="empty-state">
              Not wired to backend yet — no placement data source in v1.
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}