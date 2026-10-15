import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import StaggerGroup, { staggerItemSubtle } from '../../../shared/components/motion/StaggerGroup.jsx'
import { api } from '../../../shared/api/client.js'

export default function MockInterviewsPage() {
  const queryClient = useQueryClient()
  const [requested, setRequested] = useState(new Set())

  const { data, isLoading, isError } = useQuery({
    queryKey: ['interview-matches'],
    queryFn: () => api.get('/interviews/matches'),
  })

  const requestInterview = useMutation({
    mutationFn: (targetId) => api.post('/connections', { targetId, kind: 'mock_interview' }),
    onSuccess: (_result, targetId) => {
      setRequested((s) => new Set(s).add(targetId))
      queryClient.invalidateQueries({ queryKey: ['connections'] })
    },
  })

  const matches = data?.matches ?? []

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">mock interviews</div>
          <h2 className="sec-title">Practice with someone your level</h2>
          <p className="sec-sub">Matched by CF rating within your campus, within about 80 points of yours.</p>
        </Reveal>

        {isLoading && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Finding matches…
          </p>
        )}
        {isError && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Couldn't load matches.
          </p>
        )}
        {!isLoading && !isError && matches.length === 0 && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            No close rating matches in your campus yet — check back once more students sync a CF handle.
          </p>
        )}

        <StaggerGroup className="matches-list" style={{ marginTop: 24 }}>
          {matches.map((m) => (
            <motion.div key={m.id} variants={staggerItemSubtle}>
              <Card className="match-row">
                <div className="match-who">
                  <b>{m.name}</b>
                  <span>
                    {m.campus} · CF {m.cfRating}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-ghost match-btn"
                  disabled={requested.has(m.id) || requestInterview.isPending}
                  onClick={() => requestInterview.mutate(m.id)}
                >
                  {requested.has(m.id) ? 'Requested' : 'Request'}
                </button>
              </Card>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}