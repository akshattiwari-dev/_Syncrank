import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { api } from '../../../shared/api/client.js'

export default function MentorshipPage() {
  const queryClient = useQueryClient()
  const [requested, setRequested] = useState(new Set())

  const { data, isLoading, isError } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => api.get('/mentorship/mentors'),
  })

  const requestMentor = useMutation({
    mutationFn: (targetId) => api.post('/connections', { targetId, kind: 'mentorship' }),
    onSuccess: (_result, targetId) => {
      setRequested((s) => new Set(s).add(targetId))
      queryClient.invalidateQueries({ queryKey: ['connections'] })
    },
  })

  const mentors = data?.mentors ?? []

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">alumni mentorship</div>
          <h2 className="sec-title">Learn from people who've done it</h2>
          <p className="sec-sub">
            Students and alumni who opted in to mentor. No guaranteed response time — this runs on people's spare
            time.
          </p>
        </Reveal>

        {isLoading && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Loading mentors…
          </p>
        )}
        {isError && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Couldn't load mentors.
          </p>
        )}
        {!isLoading && !isError && mentors.length === 0 && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            No mentors have opted in yet.
          </p>
        )}

        <div className="teammates-grid" style={{ marginTop: 24 }}>
          {mentors.map((m, i) => (
            <Reveal key={m.id} delay={0.04 * i}>
              <Card className="teammate-card">
                <div className="teammate-avatar">{m.name[0]}</div>
                <h4>{m.name}</h4>
                <div className="teammate-strength mono">{m.campus.name}</div>
                <div className="skillcard-tags" style={{ marginTop: 4 }}>
                  {(m.mentorTags || []).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ width: '100%', marginTop: 12 }}
                  disabled={requested.has(m.id) || requestMentor.isPending}
                  onClick={() => requestMentor.mutate(m.id)}
                >
                  {requested.has(m.id) ? 'Request sent' : 'Request mentorship'}
                </button>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}