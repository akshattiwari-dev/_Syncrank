import { useQuery } from '@tanstack/react-query'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { api } from '../../../shared/api/client.js'

export default function PracticePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['practice-plan'],
    queryFn: () => api.get('/practice/plan'),
  })

  const plan = data?.plan ?? []

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">practice plan</div>
          <h2 className="sec-title">Where you lag your campus</h2>
          <p className="sec-sub">
            Compares your CF rating and recent LeetCode activity against your campus average — a simplified v1
            signal, not full per-topic analysis (that needs deeper submission-tag ingestion, on the roadmap).
          </p>
        </Reveal>

        {isLoading && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Building your plan…
          </p>
        )}
        {isError && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Couldn't load your practice plan.
          </p>
        )}

        <div className="practice-list" style={{ marginTop: 24 }}>
          {plan.map((p) => (
            <Reveal key={p.area} delay={0.04}>
              <Card className="practice-row">
                <div className="practice-row-top">
                  <div>
                    <b>{p.area}</b>
                    <span className="practice-note">{p.note}</span>
                  </div>
                  <span className="practice-count mono">{p.weak}% behind campus avg</span>
                </div>
                <div className="practice-bar-track">
                  <div className="practice-bar-fill" style={{ width: `${p.weak}%` }} />
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}