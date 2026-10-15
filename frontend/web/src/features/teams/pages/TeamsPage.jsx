import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { api } from '../../../shared/api/client.js'

export default function TeamsPage() {
  const queryClient = useQueryClient()
  const [contestId, setContestId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [invited, setInvited] = useState(new Set())

  const { data: contestsData } = useQuery({
    queryKey: ['contests'],
    queryFn: () => api.get('/contests'),
  })
  const { data: teamsData } = useQuery({
    queryKey: ['my-teams'],
    queryFn: () => api.get('/teams'),
  })
  const { data: suggestionsData, isLoading, isError } = useQuery({
    queryKey: ['team-suggestions'],
    queryFn: () => api.get('/teams/suggestions'),
  })

  const createTeam = useMutation({
    mutationFn: () => api.post('/teams', { contestId, name: teamName.trim() }),
    onSuccess: () => {
      setTeamName('')
      queryClient.invalidateQueries({ queryKey: ['my-teams'] })
    },
  })

  const invite = useMutation({
    mutationFn: ({ teamId, userId }) => api.post(`/teams/${teamId}/invite`, { userId }),
    onSuccess: (_result, { userId }) => setInvited((s) => new Set(s).add(userId)),
  })

  const contests = contestsData?.contests ?? contestsData ?? []
  const myTeams = teamsData?.teams ?? []
  const activeTeam = myTeams[0]
  const suggestions = suggestionsData?.suggestions ?? []

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">team up</div>
          <h2 className="sec-title">Find teammates for team contests</h2>
          <p className="sec-sub">
            Suggested by complementary rating within your campus — someone strong where you're weak covers more
            ground in a team round.
          </p>
        </Reveal>

        {!activeTeam && (
          <Reveal delay={0.05}>
            <Card className="team-create-card" style={{ marginTop: 20 }}>
              <h4>Create a team</h4>
              <div className="form-row">
                <label htmlFor="contest-select">Contest</label>
                <select id="contest-select" value={contestId} onChange={(e) => setContestId(e.target.value)}>
                  <option value="">Select a contest…</option>
                  {contests.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="team-name">Team name</label>
                <input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              </div>
              {createTeam.isError && <p className="form-error">{createTeam.error.message}</p>}
              <button
                type="button"
                className="btn-primary"
                disabled={!contestId || !teamName.trim() || createTeam.isPending}
                onClick={() => createTeam.mutate()}
              >
                {createTeam.isPending ? 'Creating…' : 'Create team'}
              </button>
            </Card>
          </Reveal>
        )}

        {activeTeam && (
          <Reveal delay={0.05}>
            <p className="sec-sub" style={{ marginTop: 12 }}>
              Your team: <b>{activeTeam.name}</b> ({activeTeam.members.length} member
              {activeTeam.members.length === 1 ? '' : 's'})
            </p>
          </Reveal>
        )}

        {isLoading && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Finding teammates…
          </p>
        )}
        {isError && (
          <p className="sec-sub" style={{ marginTop: 20 }}>
            Couldn't load suggestions.
          </p>
        )}

        <div className="teammates-grid" style={{ marginTop: 24 }}>
          {suggestions.map((t, i) => (
            <Reveal key={t.id} delay={0.04 * i}>
              <Card className="teammate-card">
                <div className="teammate-avatar">{t.name[0]}</div>
                <h4>{t.name}</h4>
                <div className="teammate-cf mono">{t.cfHandle ? `CF ${t.cfRating}` : 'No CF handle linked'}</div>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ width: '100%', marginTop: 12 }}
                  disabled={!activeTeam || invited.has(t.id) || invite.isPending}
                  onClick={() => invite.mutate({ teamId: activeTeam.id, userId: t.id })}
                  title={!activeTeam ? 'Create a team first' : undefined}
                >
                  {invited.has(t.id) ? 'Invite sent' : 'Invite to team'}
                </button>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}