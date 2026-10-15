import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { useAuth, ApiError } from '../AuthProvider.jsx'
import { api, API_URL } from '../../../shared/api/client.js'

export default function LoginPage() {
  const { login, refresh } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const oauthError = searchParams.get('error')

  const [mode, setMode] = useState('password') // 'password' | 'otp'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from ?? '/dashboard'

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function switchMode(next) {
    setMode(next)
    setError(null)
    setInfo(null)
    setOtpSent(false)
    setCode('')
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not log in — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function sendOtp() {
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      await api.post('/auth/otp/login/send', { email })
      setOtpSent(true)
      setCooldown(60)
      setInfo('If this email is registered, a 6-digit code has been sent.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send code — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault()
    if (!otpSent) return sendOtp()
    setError(null)
    setSubmitting(true)
    try {
      await api.post('/auth/otp/login/verify', { email, code })
      await refresh()
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const tabStyle = (active) => ({
    flex: 1,
    padding: '8px 0',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid var(--accent, #d9b26a)' : '2px solid transparent',
    color: active ? 'inherit' : 'var(--muted)',
    font: 'inherit',
  })

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

            <div style={{ display: 'flex', marginBottom: 18 }}>
              <button type="button" style={tabStyle(mode === 'password')} onClick={() => switchMode('password')}>
                Password
              </button>
              <button type="button" style={tabStyle(mode === 'otp')} onClick={() => switchMode('otp')}>
                Email OTP
              </button>
            </div>

            {mode === 'password' ? (
              <form onSubmit={handlePasswordSubmit}>
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
            ) : (
              <form onSubmit={handleOtpSubmit}>
                <div className="form-row">
                  <label htmlFor="otp-email">Email</label>
                  <input
                    id="otp-email"
                    type="email"
                    required
                    disabled={otpSent}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {otpSent && (
                  <div className="form-row">
                    <label htmlFor="otp-code">6-digit code</label>
                    <input
                      id="otp-code"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                )}
                {info && <div style={{ marginBottom: 14, color: 'var(--muted)' }}>{info}</div>}
                {error && (
                  <div className="form-error" style={{ marginBottom: 14 }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || (otpSent && code.length !== 6)}
                >
                  {submitting ? 'Please wait…' : otpSent ? 'Verify & log in' : 'Send code'}
                </button>
                {otpSent && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ marginLeft: 10, background: 'transparent', border: '1px solid var(--muted)' }}
                    disabled={cooldown > 0 || submitting}
                    onClick={sendOtp}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                  </button>
                )}
                {otpSent && (
                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setCode(''); setInfo(null); setError(null) }}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
                    >
                      Use a different email
                    </button>
                  </div>
                )}
              </form>
            )}

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
