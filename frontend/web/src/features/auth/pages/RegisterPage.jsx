import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { useAuth, ApiError } from '../AuthProvider.jsx'
import { api, API_URL } from '../../../shared/api/client.js'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oauthError = searchParams.get('error')

  const [campuses, setCampuses] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', campusId: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .get('/campuses')
      .then((data) => setCampuses(data.campuses ?? []))
      .catch(() => setCampuses([]))
  }, [])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create an account — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">create account</div>
          <h2 className="sec-title">Register for SyncRank</h2>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="form-card">
            {(oauthError === 'campus_required' || oauthError === 'invalid_campus') && (
              <div className="form-error" style={{ marginBottom: 14 }}>
                Select your campus first, then continue with Google.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="reg-name">Name</label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label htmlFor="reg-email">Campus email</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label htmlFor="reg-campus">Campus</label>
                {campuses.length > 0 ? (
                  <select
                    id="reg-campus"
                    name="campusId"
                    required
                    value={form.campusId}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select your campus
                    </option>
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="reg-campus"
                    name="campusId"
                    type="text"
                    placeholder="Campus ID (ask your admin)"
                    required
                    value={form.campusId}
                    onChange={handleChange}
                  />
                )}
              </div>
              {error && (
                <div className="form-error" style={{ marginBottom: 14 }}>
                  {error}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <div
              style={{
                margin: '16px 0 8px',
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: 13,
              }}
            >
              or
            </div>
            <a
              href={
                form.campusId
                  ? `${API_URL}/auth/google?campusId=${encodeURIComponent(form.campusId)}`
                  : '#'
              }
              className="btn-primary"
              style={{
                display: 'block',
                textAlign: 'center',
                textDecoration: 'none',
                background: '#fff',
                color: '#1f1f1f',
                border: '1px solid #dadce0',
                opacity: form.campusId ? 1 : 0.6,
              }}
              onClick={(e) => {
                if (!form.campusId) {
                  e.preventDefault()
                  setError('Select a campus before continuing with Google')
                }
              }}
            >
              Continue with Google
            </a>
          </Card>
        </Reveal>

        <p className="sec-sub" style={{ marginTop: 16 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  )
}