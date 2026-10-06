import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import { api, ApiError } from '../../../shared/api/client.js'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(searchParams.get('token') ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset password — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">account</div>
          <h2 className="sec-title">Reset password</h2>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="reset-token">Reset token</label>
                <input
                  id="reset-token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token from server logs"
                />
              </div>
              <div className="form-row">
                <label htmlFor="reset-password">New password</label>
                <input
                  id="reset-password"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="form-error" style={{ marginBottom: 14 }}>
                  {error}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Set new password'}
              </button>
            </form>
          </Card>
        </Reveal>

        <p className="sec-sub" style={{ marginTop: 16 }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </section>
  )
}
