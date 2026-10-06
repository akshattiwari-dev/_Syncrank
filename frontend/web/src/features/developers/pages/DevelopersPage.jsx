import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { api } from '../../../shared/api/client.js'

const ENDPOINTS = [{ method: 'GET', path: '/developer/v1/leaderboard/:campusId', desc: 'Read-only campus leaderboard' }]

export default function DevelopersPage() {
  const queryClient = useQueryClient()
  const [label, setLabel] = useState('')
  const [newKey, setNewKey] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['developer-keys'],
    queryFn: () => api.get('/developer/keys'),
  })

  const createKey = useMutation({
    mutationFn: (label) => api.post('/developer/keys', { label }),
    onSuccess: (result) => {
      setNewKey(result.key)
      setLabel('')
      queryClient.invalidateQueries({ queryKey: ['developer-keys'] })
    },
  })

  const revokeKey = useMutation({
    mutationFn: (id) => api.delete(`/developer/keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['developer-keys'] }),
  })

  const keys = data?.keys ?? []

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">developers</div>
          <h2 className="sec-title">API access</h2>
          <p className="sec-sub">Read-only access to campus leaderboard data. Rate-limited to 100 requests/hour per key.</p>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="api-key-card">
            {newKey ? (
              <>
                <div className="api-key-row">
                  <span className="mono">{newKey}</span>
                </div>
                <p className="api-key-note">
                  This is the only time this key is shown — copy it now. Reload the page to see the masked version
                  afterward.
                </p>
              </>
            ) : (
              <div className="api-key-row" style={{ gap: 8 }}>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Key label (e.g. Discord bot)"
                  className="mono"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!label.trim() || createKey.isPending}
                  onClick={() => createKey.mutate(label.trim())}
                >
                  {createKey.isPending ? 'Generating…' : 'Generate key'}
                </button>
              </div>
            )}
            {createKey.isError && <p className="api-key-note">{createKey.error.message}</p>}
          </Card>
        </Reveal>

        {!isLoading && keys.length > 0 && (
          <Reveal delay={0.08}>
            <Card className="prose-card" style={{ marginTop: 16 }}>
              <h4>Your keys</h4>
              {keys.map((k) => (
                <div key={k.id} className="api-key-row" style={{ marginTop: 10 }}>
                  <span>{k.label}</span>
                  <span className="mono">{k.keyPreview}</span>
                  <button type="button" className="btn-ghost" onClick={() => revokeKey.mutate(k.id)}>
                    Revoke
                  </button>
                </div>
              ))}
            </Card>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <Card className="prose-card" style={{ marginTop: 20 }}>
            <h4>Endpoints</h4>
            {ENDPOINTS.map((e) => (
              <p key={e.path} style={{ marginTop: 10 }}>
                <span className="api-method mono">{e.method}</span> <span className="mono">{e.path}</span> — {e.desc}
              </p>
            ))}
          </Card>
        </Reveal>
      </div>
    </section>
  )
}