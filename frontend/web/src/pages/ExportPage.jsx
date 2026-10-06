import { useState } from 'react'
import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'

const BRANCHES = ['All branches', 'CSE', 'ECE', 'IT']
const RANK_FILTERS = ['All ranks', 'Top 50', 'Top 100', 'Sync Score 900+']

export default function ExportPage() {
  const [notice, setNotice] = useState(false)
  const [branch, setBranch] = useState(BRANCHES[0])
  const [rankFilter, setRankFilter] = useState(RANK_FILTERS[0])

  function handleDownload() {
    setNotice(true)
    setTimeout(() => setNotice(false), 2600)
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">placement export</div>
          <h2 className="sec-title">Export campus rankings</h2>
          <p className="sec-sub">
            For campus admins with placement access. Filter, then export — name, CF/LC handles,
            rating, solve count, and Sync Score — as a CSV.
          </p>
        </Reveal>

        <Reveal delay={0.03}>
          <div className="filters" style={{ marginTop: 20 }}>
            {BRANCHES.map((b) => (
              <div key={b} className={`chip${branch === b ? ' on' : ''}`} onClick={() => setBranch(b)}>
                {b}
              </div>
            ))}
          </div>
          <div className="filters">
            {RANK_FILTERS.map((r) => (
              <div key={r} className={`chip${rankFilter === r ? ' on' : ''}`} onClick={() => setRankFilter(r)}>
                {r}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <Card className="export-card">
            <div className="export-row">
              <div>
                <h4>SRM Institute — {branch} · {rankFilter}</h4>
                <p>2,140 students in campus · last synced 4m ago</p>
              </div>
              <button type="button" className="btn-primary" onClick={handleDownload} disabled={notice}>
                {notice ? 'Preparing file…' : 'Download CSV'}
              </button>
            </div>
            {notice && (
              <div className="export-toast">
                This is a demo export — no file is generated. In production this would download a
                CSV filtered to {branch.toLowerCase()} / {rankFilter.toLowerCase()}.
              </div>
            )}
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
