import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { problemBank } from '../../../shared/data/mockData.js'
import { api, ApiError } from '../../../shared/api/client.js'

const DIFF_CLASS = { easy: 'diff-easy', med: 'diff-med', hard: 'diff-hard' }

export default function CreateContestPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [visibility, setVisibility] = useState('campus')
  const [scoring, setScoring] = useState('acm')
  const [participants, setParticipants] = useState('all')
  const [selected, setSelected] = useState([])
  const [errors, setErrors] = useState({})
  const [published, setPublished] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  function addProblem(p) {
    if (selected.some((s) => s.code === p.code)) return
    setSelected((s) => [...s, { ...p, points: p.diff === 'hard' ? 500 : p.diff === 'med' ? 300 : 100 }])
  }
  function removeProblem(code) {
    setSelected((s) => s.filter((p) => p.code !== code))
  }
  function move(code, dir) {
    setSelected((s) => {
      const i = s.findIndex((p) => p.code === code)
      const j = i + dir
      if (j < 0 || j >= s.length) return s
      const next = [...s]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function validate() {
    const e = {}
    if (!title.trim()) e.title = 'Contest title is required.'
    if (!startDate || !startTime) e.start = 'Pick a start date and time.'
    if (selected.length === 0) e.problems = 'Add at least one problem.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave(status) {
    if (status === 'publish' && !validate()) return
    if (!title.trim() || !startDate || !startTime) {
      setErrors((e) => ({ ...e, title: !title.trim() ? 'Contest title is required.' : e.title }))
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      const startAt = new Date(`${startDate}T${startTime}`).toISOString()
      const { contest } = await api.post('/contests', {
        title: title.trim(),
        description: description.trim() || undefined,
        startAt,
        durationMins: Number(duration),
        visibility,
        scoringMode: scoring,
        participantsMode: participants,
        problems: selected.map((p, i) => ({
          code: p.code,
          title: p.title,
          difficulty: p.diff,
          points: p.points,
          order: i,
        })),
      })

      if (status === 'publish') {
        await api.post(`/contests/${contest.id}/publish`)
      }

      setPublished({
        status,
        title: contest.title,
        start: `${startDate} ${startTime}`,
        problemCount: selected.length,
      })
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save the contest — try again.')
    } finally {
      setSaving(false)
    }
  }

  if (published) {
    return (
      <section style={{ paddingTop: 40 }}>
        <div className="section-inner--tight section-inner">
          <div className="form-success" style={{ maxWidth: 480 }}>
            <div className="form-success-mark">✓</div>
            <h4>{published.status === 'publish' ? 'Contest published' : 'Draft saved'}</h4>
            <p>
              <b>{published.title}</b> · {published.start} · {published.problemCount} problems
            </p>
            <div className="hero-ctas" style={{ marginTop: 18, justifyContent: 'center' }}>
              <Link className="btn-primary" to="/arena">
                View in Arena
              </Link>
              <Link className="btn-ghost" to="/admin">
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">campus admin</div>
          <h2 className="sec-title">Create a contest</h2>
          <p className="sec-sub">Campus-scoped by default. Draft first if you're not ready to schedule it.</p>
        </Reveal>

        <Reveal delay={0.04}>
          <Card className="form-card" style={{ maxWidth: 640, marginTop: 22 }}>
            <div className="form-row">
              <label htmlFor="cc-title">Contest title</label>
              <input id="cc-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekly Sync Cup #16" />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-row">
              <label htmlFor="cc-desc">Description (optional)</label>
              <textarea id="cc-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Five problems, one hour, campus-only." />
            </div>

            <div className="form-grid-2">
              <div className="form-row">
                <label htmlFor="cc-date">Start date</label>
                <input id="cc-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="cc-time">Start time</label>
                <input id="cc-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
            </div>
            {errors.start && <div className="form-error" style={{ marginTop: -10, marginBottom: 14 }}>{errors.start}</div>}

            <div className="form-row">
              <label htmlFor="cc-duration">Duration (minutes)</label>
              <input id="cc-duration" type="number" min="15" step="15" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>

            <div className="form-row">
              <label>Visibility</label>
              <div className="filters" style={{ marginTop: 0 }}>
                <div className={`chip${visibility === 'campus' ? ' on' : ''}`} onClick={() => setVisibility('campus')}>Campus only</div>
                <div className={`chip${visibility === 'public' ? ' on' : ''}`} onClick={() => setVisibility('public')}>Public link</div>
              </div>
            </div>

            <div className="form-row">
              <label>Scoring</label>
              <div className="filters" style={{ marginTop: 0 }}>
                <div className={`chip${scoring === 'acm' ? ' on' : ''}`} onClick={() => setScoring('acm')}>ACM (penalty)</div>
                <div className={`chip${scoring === 'score' ? ' on' : ''}`} onClick={() => setScoring('score')}>Score-based</div>
              </div>
            </div>

            <div className="form-row">
              <label>Participants</label>
              <div className="filters" style={{ marginTop: 0 }}>
                <div className={`chip${participants === 'all' ? ' on' : ''}`} onClick={() => setParticipants('all')}>All synced students</div>
                <div className={`chip${participants === 'invite' ? ' on' : ''}`} onClick={() => setParticipants('invite')}>Invite-only</div>
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card style={{ maxWidth: 640, marginTop: 16, padding: '20px 22px' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Problems</h4>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>
              Pull from the shared problem bank, then reorder or drop points.
            </p>

            {errors.problems && <div className="form-error" style={{ marginBottom: 10 }}>{errors.problems}</div>}

            {selected.length === 0 ? (
              <div className="empty-state">No problems added yet — pick a few below.</div>
            ) : (
              <div className="builder-list">
                {selected.map((p, i) => (
                  <div className="builder-row" key={p.code}>
                    <span className={`diff-dot ${DIFF_CLASS[p.diff]}`} />
                    <span className="mono builder-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="builder-title">{p.title}</span>
                    <span className="mono builder-code">{p.code}</span>
                    <span className="mono builder-points">{p.points} pts</span>
                    <div className="builder-actions">
                      <button type="button" onClick={() => move(p.code, -1)} disabled={i === 0}>↑</button>
                      <button type="button" onClick={() => move(p.code, 1)} disabled={i === selected.length - 1}>↓</button>
                      <button type="button" onClick={() => removeProblem(p.code)} className="builder-remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="builder-bank">
              {problemBank
                .filter((p) => !selected.some((s) => s.code === p.code))
                .map((p) => (
                  <div className="builder-bank-row" key={p.code} onClick={() => addProblem(p)}>
                    <span className={`diff-dot ${DIFF_CLASS[p.diff]}`} />
                    <span className="builder-title">{p.title}</span>
                    <span className="mono builder-code">{p.code} · {p.rating}</span>
                    <span className="builder-add">+ add</span>
                  </div>
                ))}
            </div>
          </Card>
        </Reveal>

        {saveError && (
          <div className="form-error" style={{ marginTop: 12 }}>
            {saveError}
          </div>
        )}
        <div className="hero-ctas" style={{ marginTop: 20, marginBottom: 40 }}>
          <button type="button" className="btn-primary" onClick={() => handleSave('publish')} disabled={saving}>
            {saving ? 'Saving…' : 'Publish contest'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => handleSave('draft')} disabled={saving}>
            {saving ? 'Saving…' : 'Save draft'}
          </button>
        </div>
      </div>
    </section>
  )
}
