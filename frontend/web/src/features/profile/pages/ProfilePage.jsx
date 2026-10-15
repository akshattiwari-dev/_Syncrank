import { useAuth } from '../../auth/AuthProvider.jsx'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../shared/api/client.js'
import Card from '../../../shared/components/Card.jsx'
import LineChart from '../../../shared/components/charts/LineChart.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'

const SKILLS = ['Dynamic Programming', 'Graphs', 'Segment Trees', 'Binary Search']

export default function ProfilePage() {
  const { user } = useAuth()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/me/dashboard'),
  })
  if (isLoading) {
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner" style={{ color: 'var(--muted)' }}>
        Loading profile…
      </div>
    </section>
  )
}

if (isError || !data) {
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner" style={{ color: 'var(--muted)' }}>
        Could not load profile.
      </div>
    </section>
  )
}
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">profile</div>
          <h2 className="sec-title">Your shareable SyncRank card.</h2>
        </Reveal>

        <div className="profile-grid" style={{ marginTop: 30 }}>
          <Reveal delay={0.05}>
            <Card className="profile-card">
              <div className="avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
              <h3>{user?.name || 'User'}</h3>
              <div className="handle">
                {user?.campus?.name || 'Campus'}
                </div>
              <div className="last-synced mono" style={{ marginTop: 4 }}>
                {data.handles?.lastSyncedAt
                ? `synced ${new Date(data.handles.lastSyncedAt).toLocaleString()}`
                : 'not synced yet'}
                </div>
              <div className="badge-row">
                {data.handles?.cfHandle && (
                  <span className="badge cf">
                    CF: {data.handles.cfHandle}
                    {data.latestSnapshot?.cfRating ? ` · ${data.latestSnapshot.cfRating}` : ''}
                    </span>
                  )}
                  {data.handles?.lcUsername && (
                    <span className="badge lc">
                      LC: {data.handles.lcUsername}
                      {data.latestSnapshot?.lcSolvedTotal ? ` · ${data.latestSnapshot.lcSolvedTotal} solved` : ''}
                      </span>
                    )}
                    </div>
              <div className="skill-tags">
                {SKILLS.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </Card>
          </Reveal>

          <div>
            <Reveal delay={0.1}>
              <Card className="stat-row" style={{ padding: 22, marginBottom: 0 }}>
                <div className="stat-tile">
                  <div className="v mono">{data.latestSnapshot?.cfRating ?? '—'}</div>
                  <div className="l">CF rating</div>
                </div>
                <div className="stat-tile">
                  <div className="v mono">{data.latestSnapshot?.lcSolvedTotal ?? '—'}</div>
                  <div className="l">LC solved</div>
                </div>
                <div className="stat-tile">
                  <div className="v mono">{data.latestSnapshot?.syncScore ?? '—'}</div>
                  <div className="l">sync score</div>
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.15}>
              <Card className="growth-graph">
                <h3>Growth — last 90 days</h3>
                <LineChart
                  series={[
                    {
                      color: 'var(--gold)',
                      width: 2.5,
                      // Not a straight climb — there's a two-week plateau (exam season)
                      // around the midpoint before rating recovers.
                      path: 'M0,138 C60,132 100,115 160,108 C200,104 235,118 265,122 C300,116 350,88 400,58 C440,44 470,34 500,30',
                    },
                    {
                      color: 'var(--rust)',
                      width: 1.6,
                      dashed: true,
                      opacity: 0.85,
                      path: 'M0,145 C60,142 100,138 160,130 C220,124 260,112 320,108 C380,100 440,92 500,85',
                    },
                  ]}
                />
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
