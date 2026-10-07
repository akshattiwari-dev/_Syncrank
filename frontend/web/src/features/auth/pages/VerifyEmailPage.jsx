import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { useAuth, ApiError } from '../AuthProvider.jsx'
import { api } from '../../../shared/api/client.js'

export default function VerifyEmailPage() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const sentOnce = useRef(false)

  async function sendCode() {
    setError(null)
    try {
      const res = await api.post('/auth/otp/send', {})
      if (res.alreadyVerified) return navigate('/dashboard', { replace: true })
      setInfo('Code sent. Check your email.')
      setCooldown(60)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send code')
    }
  }

  useEffect(() => {
    if (sentOnce.current) return
    sentOnce.current = true
    sendCode()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await api.post('/auth/otp/verify', { code })
      await refresh()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">verify email</div>
          <h2 className="sec-title">Enter your code</h2>
          <p className="sec-sub">We sent a 6-digit code to {user?.email || 'your email'}.</p>
        </Reveal>
        <Reveal delay={0.05}>
          <Card className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="otp">6-digit code</label>
                <input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="\d{6}"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              {info && <div style={{ marginBottom: 14, color: 'var(--muted)' }}>{info}</div>}
              {error && <div className="form-error" style={{ marginBottom: 14 }}>{error}</div>}
              <button type="submit" className="btn-primary" disabled={busy || code.length !== 6}>
                {busy ? 'Verifying…' : 'Verify'}
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ marginLeft: 10, background: 'transparent', border: '1px solid var(--muted)' }}
                disabled={cooldown > 0}
                onClick={sendCode}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </form>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
