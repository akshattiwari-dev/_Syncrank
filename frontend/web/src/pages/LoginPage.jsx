import { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'
import { useAuth, ApiError } from '../auth/AuthProvider.jsx'
import { API_URL } from '../api/client.js'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const oauthError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(location.state?.from ?? '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not log in — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">sign in</div>
          <h2 className="sec-title">Log in to SyncRank</h2>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="form-card">
            {(oauthError === 'campus_required' ||
              oauthError === 'google_failed' ||
              oauthError === 'google_denied' ||
              oauthError === 'google_not_configured') && (
              <div className="form-error" style={{ marginBottom: 14 }}>
                {oauthError === 'campus_required' &&
                  'Pick a campus on the register page, then use Continue with Google.'}
                {oauthError === 'google_failed' && 'Google sign-in failed — try again.'}
                {oauthError === 'google_denied' && 'Google sign-in was cancelled.'}
                {oauthError === 'google_not_configured' &&
                  'Google sign-in is not configured on the server.'}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="form-error" style={{ marginBottom: 14 }}>
                  {error}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Logging in…' : 'Log in'}
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
              href={`${API_URL}/auth/google`}
              className="btn-primary"
              style={{
                display: 'block',
                textAlign: 'center',
                textDecoration: 'none',
                background: '#fff',
                color: '#1f1f1f',
                border: '1px solid #dadce0',
              }}
            >
              Continue with Google
            </a>
          </Card>
        </Reveal>

        <p className="sec-sub" style={{ marginTop: 16 }}>
          <Link to="/forgot-password">Forgot password?</Link>
          {' · '}
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </section>
  )
}