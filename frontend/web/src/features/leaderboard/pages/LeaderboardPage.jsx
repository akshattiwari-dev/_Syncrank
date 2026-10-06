import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import StaggerGroup, { staggerItemSubtle } from '../../../shared/components/motion/StaggerGroup.jsx'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { api } from '../../../shared/api/client.js'

// "Inter-Campus" existed as a UI concept in the original mock design but
// has no backing endpoint in the MVP API — hidden rather than shown and
// silently broken. Re-add once /leaderboard/inter-campus exists.
const TOGGLE_OPTIONS = ['Campus', 'Global']
const BRANCH_FILTERS = ['All branches', 'CSE', 'ECE', 'IT']

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [activeToggle, setActiveToggle] = useState('Campus')
  const [branch, setBranch] = useState('All branches')
  const [page, setPage] = useState(1)

  const isCampus = activeToggle === 'Campus'
  const branchParam = branch !== 'All branches' ? `&branch=${encodeURIComponent(branch)}` : ''

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['leaderboard', activeToggle, branch, page, user?.campus?.id],
    queryFn: () =>
      isCampus
        ? api.get(`/campuses/${user.campus.id}/leaderboard?page=${page}&pageSize=25${branchParam}`)
        : api.get(`/leaderboard/global?page=${page}&pageSize=25`),
    enabled: Boolean(user),
  })

  const rankClass = (rank) => (rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '')

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">leaderboards</div>
          <h2 className="sec-title">Leaderboard</h2>
        </Reveal>

        <div className="lb-toggle" style={{ marginTop: 26 }}>
          {TOGGLE_OPTIONS.map((opt) => (
            <button
              key={opt}
              className={activeToggle === opt ? 'active' : ''}
              onClick={() => {
                setActiveToggle(opt)
                setPage(1)
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {isCampus && (
          <div className="filters">
            {BRANCH_FILTERS.map((f) => (
              <div
                key={f}
                className={`chip${branch === f ? ' on' : ''}`}
                onClick={() => {
                  setBranch(f)
                  setPage(1)
                }}
              >
                {f}
              </div>
            ))}
          </div>
        )}

        <Reveal delay={0.05}>
          <Card className="lb-table" hover={false}>
            <div className="lb-head lb-head-sticky">
              <span>#</span>
              <span>Student</span>
              <span>Codeforces</span>
              <span>LeetCode</span>
              <span>Sync</span>
              {!isCampus && <span>Campus</span>}
            </div>

            {isLoading && <div className="empty-state">Loading leaderboard…</div>}
            {isError && <div className="form-error" style={{ padding: 20 }}>Couldn't load leaderboard: {error.message}</div>}
            {data && data.rows.length === 0 && <div className="empty-state">No students match this filter yet.</div>}

            {data && (
              <StaggerGroup>
                {data.rows.map((s) => (
                  <motion.div className="lb-row" key={s.id} variants={staggerItemSubtle}>
                    <div className={`lb-rk ${rankClass(s.rank)}`}>{s.rank}</div>
                    <div className="lb-who">
                      <b>{s.name}</b>
                      {isCampus && <span>{s.branch ?? '—'}</span>}
                    </div>
                    <div className="lb-p cf">CF {s.cfRating ?? '—'}</div>
                    <div className="lb-p lc">LC {s.lcSolvedTotal ?? '—'}</div>
                    <div className="lb-score mono">{s.syncScore}</div>
                    {!isCampus && <div className="lb-p">{s.campusName}</div>}
                  </motion.div>
                ))}
              </StaggerGroup>
            )}
          </Card>
        </Reveal>

        {data && data.total > data.rows.length && (
          <div className="hero-ctas" style={{ marginTop: 16 }}>
            <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Previous
            </button>
            <button className="btn-ghost" disabled={page * data.pageSize >= data.total} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
