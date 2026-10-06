import { useQuery } from '@tanstack/react-query'
import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'
import { api } from '../api/client.js'

const STATUS_LABEL = { live: 'Live', upcoming: 'Upcoming', completed: 'Completed' }

export default function TournamentsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => api.get('/tournaments'),
  })

  const tournaments = data?.tournaments ?? []

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">inter-campus tournaments</div>
          <h2 className="sec-title">Campus vs campus</h2>
          <p className="sec-sub">
            Score is aggregate Sync Score gain across each campus's top 20 participants during the tournament window.
          </p>
        </Reveal>

        {isLoading && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Loading tournaments…
          </p>
        )}
        {isError && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Couldn't load tournaments.
          </p>
        )}
        {!isLoading && !isError && tournaments.length === 0 && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            No tournaments scheduled yet.
          </p>
        )}

        <div className="tournament-list" style={{ marginTop: 24 }}>
          {tournaments.map((t, i) => (
            <Reveal key={t.id} delay={0.04 * i}>
              <Card className="tournament-row">
                <div className="tournament-top">
                  <span className={`tournament-status ts-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                  <span className="tournament-name">{t.name}</span>
                </div>
                <div className="tournament-vs">
                  <div className="tournament-side">
                    <span>{t.campusA.name}</span>
                    {t.scoreA != null && <span className="mono">{t.scoreA}</span>}
                  </div>
                  <span className="tournament-vs-label">vs</span>
                  <div className="tournament-side">
                    <span>{t.campusB.name}</span>
                    {t.scoreB != null && <span className="mono">{t.scoreB}</span>}
                  </div>
                </div>
                <div className="tournament-date mono">
                  {new Date(t.windowStart).toLocaleDateString()} – {new Date(t.windowEnd).toLocaleDateString()}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}