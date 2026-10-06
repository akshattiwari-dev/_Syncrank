import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { api } from '../../../shared/api/client.js'

export default function IntegrationsPage() {
  const queryClient = useQueryClient()
  const [url, setUrl] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => api.get('/webhooks'),
  })

  const addWebhook = useMutation({
    mutationFn: (url) => api.post('/webhooks', { url, events: ['rank_change'] }),
    onSuccess: () => {
      setUrl('')
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })

  const removeWebhook = useMutation({
    mutationFn: (id) => api.delete(`/webhooks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
  })

  const webhooks = data?.webhooks ?? []

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">integrations</div>
          <h2 className="sec-title">Webhooks &amp; notifications</h2>
          <p className="sec-sub">
            Get a POST request whenever your Sync Score updates — pipe it into Discord, Slack, or anything else that
            accepts a webhook URL.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="integration-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/…"
              className="mono"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={!url.trim() || addWebhook.isPending}
              onClick={() => addWebhook.mutate(url.trim())}
            >
              {addWebhook.isPending ? 'Adding…' : 'Add webhook'}
            </button>
          </Card>
          {addWebhook.isError && <p className="sec-sub">{addWebhook.error.message}</p>}
        </Reveal>

        <div className="integration-list" style={{ marginTop: 24 }}>
          {!isLoading && webhooks.length === 0 && <p className="sec-sub">No webhooks registered yet.</p>}
          {webhooks.map((w, idx) => (
            <Reveal key={w.id} delay={0.05 * idx}>
              <Card className="integration-row">
                <div>
                  <h4 className="mono" style={{ fontSize: 13 }}>
                    {w.url}
                  </h4>
                  <p>{w.events.join(', ')}</p>
                </div>
                <button type="button" className="btn-ghost" onClick={() => removeWebhook.mutate(w.id)}>
                  Remove
                </button>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}