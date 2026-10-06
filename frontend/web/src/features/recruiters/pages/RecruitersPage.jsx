import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { api } from '../../../shared/api/client.js'

export default function RecruitersPage() {
  const [minScore, setMinScore] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recruiters', minScore],
    queryFn: () => api.get(`/recruiters/candidates?minScore=${minScore}&pageSize=50`),
  })

  const rows = data?.rows ?? []

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">recruiter portal</div>
          <h2 className="sec-title">Search verified candidates</h2>
          <p className="sec-sub">
            Every number here is synced from public Codeforces/LeetCode data, not self-reported.
            Only students who've opted in to recruiter visibility appear here.{' '}
            <Link to="/contact">Contact us</Link> for full recruiter access.
          </p>
        </Reveal>

        <div className="filters" style={{ marginTop: 22 }}>
          {[0, 800, 900, 950].map((v) => (
            <div key={v} className={`chip${minScore === v ? ' on' : ''}`} onClick={() => setMinScore(v)}>
              {v === 0 ? 'All scores' : `Sync Score ${v}+`}
            </div>
          ))}
        </div>

        {isLoading && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Loading candidates…
          </p>
        )}
        {isError && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Couldn't load candidates. Try again shortly.
          </p>
        )}
        {!isLoading && !isError && rows.length === 0 && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            No students have opted in to recruiter visibility yet.
          </p>
        )}

        {rows.length > 0 && (
          <Card className="lb-table recruiter-table" hover={false}>
            <div className="lb-head">
              <span>Student</span>
              <span>Campus</span>
              <span>CF</span>
              <span>LC</span>
              <span>Score</span>
              <span>Grad</span>
            </div>
            {rows.map((c) => (
              <div className="lb-row" key={c.id}>
                <div className="lb-who">
                  <b>{c.name}</b>
                  <span>{c.branch || '—'}</span>
                </div>
                <div className="lb-p">{c.campus}</div>
                <div className="lb-p cf">{c.cfHandle ? `CF ${c.cfRating ?? '—'}` : '—'}</div>
                <div className="lb-p lc">{c.lcUsername ? `LC ${c.lcSolvedTotal ?? '—'}` : '—'}</div>
                <div className="lb-score mono">{c.score}</div>
                <div className="lb-p mono">{c.gradYear ?? '—'}</div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </section>
  )
}