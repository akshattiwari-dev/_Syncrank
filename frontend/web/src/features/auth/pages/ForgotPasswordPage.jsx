import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { api, ApiError } from '../../../shared/api/client.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">account</div>
          <h2 className="sec-title">Forgot password</h2>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="form-card">
            {done ? (
              <p className="sec-sub">
                If that email exists, a reset link was sent. For this demo, check the API
                server logs for the raw token, then open{' '}
                <Link to="/reset-password">Reset password</Link> and paste it.
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <label htmlFor="forgot-email">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="form-error" style={{ marginBottom: 14 }}>
                    {error}
                  </div>
                )}
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}
          </Card>
        </Reveal>

        <p className="sec-sub" style={{ marginTop: 16 }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </section>
  )
}
