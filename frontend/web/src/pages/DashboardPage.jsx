import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Card from '../components/shared/Card.jsx'
import GrowthArc from '../components/charts/GrowthArc.jsx'
import Heatmap from '../components/charts/Heatmap.jsx'
import Reveal from '../components/motion/Reveal.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { api } from '../api/client.js'

function timeAgo(iso) {
  if (!iso) return 'never'
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function DashboardPage() {
  useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/me/dashboard'),
  })

  const syncNow = useMutation({
    mutationFn: () => api.post('/me/sync'),
    onSuccess: () => {
      // Sync is async (queued to the worker) — refetch after a short delay
      // rather than immediately, so the new snapshot has time to land.
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['dashboard'] }), 4000)
    },
  })

  if (isLoading) {
    return (
      <section style={{ paddingTop: 40 }}>
        <div className="section-inner--tight section-inner" style={{ color: 'var(--muted)' }}>
          Loading your dashboard…
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section style={{ paddingTop: 40 }}>
        <div className="section-inner--tight section-inner">
          <div className="form-error">Couldn't load your dashboard: {error.message}</div>
        </div>
      </section>
    )
  }

  const hasHandles = data.handles && (data.handles.cfHandle || data.handles.lcUsername)

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">dashboard</div>
          <h2 className="sec-title">Welcome back, {data.user.name.split(' ')[0]}.</h2>
          <p className="sec-sub">Here's how your sync score and your campus moved since yesterday.</p>
        </Reveal>

        {!hasHandles ? (
          <Reveal delay={0.05}>
            <Card style={{ marginTop: 24, padding: 22 }}>
              <div className="empty-state">
                No handles linked yet — your Sync Score starts at 0 until you link Codeforces and/or
                LeetCode.
              </div>
              <Link to="/profile" className="btn-primary" style={{ marginTop: 14, display: 'inline-block' }}>
                Link your handles
              </Link>
            </Card>
          </Reveal>
        ) : (
          <div className="dash-grid" style={{ marginTop: 24 }}>
            <Reveal delay={0.05}>
              <Card className="score-card">
                <div className="score-card-head">
                  <div className="lbl">Sync Score</div>
                  <div className="last-synced mono">
                    {data.handles.isStale ? 'stale — ' : ''}
                    synced {timeAgo(data.handles.lastSyncedAt)}
                  </div>
                </div>
                <div className="score-big mono">{data.snapshot?.syncScore ?? 0}</div>
                <div className="score-sub">Weighted from Codeforces rating + LeetCode solve velocity</div>

                <div className="rank-pair">
                  <div className="rank-tile">
                    <div className="t">Campus Rank</div>
                    <div className="v">{data.snapshot?.campusRank ? `#${data.snapshot.campusRank}` : '—'}</div>
                  </div>
                  <div className="rank-tile">
                    <div className="t">Global Rank</div>
                    <div className="v">{data.snapshot?.globalRank ? `#${data.snapshot.globalRank.toLocaleString()}` : '—'}</div>
                  </div>
                  <div className="rank-tile">
                    <div className="t">CF Rating</div>
                    <div className="v">{data.snapshot?.cfRating ?? '—'}</div>
                  </div>
                  <div className="rank-tile">
                    <div className="t">LC Solved</div>
                    <div className="v">{data.snapshot?.lcSolvedTotal ?? '—'}</div>
                  </div>
                </div>

                <div className="score-card-actions">
                  <button type="button" className="btn-ghost" onClick={() => syncNow.mutate()} disabled={syncNow.isPending}>
                    {syncNow.isPending ? 'Syncing…' : syncNow.isSuccess ? 'Sync queued ✓' : 'Sync now'}
                  </button>
                  <Link to="/skill-card" className="score-card-link mono">
                    Generate skill card →
                  </Link>
                </div>
                {syncNow.isError && <div className="form-error" style={{ marginTop: 8 }}>{syncNow.error.message}</div>}
              </Card>
            </Reveal>

            <Reveal delay={0.1}>
              <Card className="growth-meter">
                <h3>Campus Growth Meter</h3>
                <GrowthArc percent={64} />
                <div className="meter-num mono">64%</div>
                <div className="meter-lbl">campus rating improvement this week</div>
              </Card>
            </Reveal>
          </div>
        )}

        <div className="dash-grid" style={{ marginTop: 16 }}>
          <Reveal delay={0.05}>
            <Card className="heatmap-card">
              <h3>Activity — last 26 weeks</h3>
              <Heatmap weeks={26} />
            </Card>
          </Reveal>

          <Reveal delay={0.08}>
            <Card className="pulse-feed">
              <h3>Campus Pulse</h3>
              <div className="empty-state">Live activity feed coming from the sync worker — check back after your campus's next sync.</div>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <Card style={{ marginTop: 16, padding: '18px 22px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--mono)' }}>Next up</h3>
            <div className="next-actions">
              <div className="next-action-row">
                <div>
                  <span className="l">weak topic</span>
                  See your practice queue
                </div>
                <Link to="/practice">Practice now →</Link>
              </div>
              {data.upcomingContest ? (
                <div className="next-action-row">
                  <div>
                    <span className="l">upcoming</span>
                    {data.upcomingContest.title}
                    {data.upcomingContest.startAt ? ` · ${new Date(data.upcomingContest.startAt).toLocaleString()}` : ''}
                  </div>
                  <Link to="/arena">View arena →</Link>
                </div>
              ) : (
                <div className="next-action-row">
                  <div>
                    <span className="l">upcoming</span>
                    No contests scheduled for your campus right now
                  </div>
                  <Link to="/arena">View arena →</Link>
                </div>
              )}
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
