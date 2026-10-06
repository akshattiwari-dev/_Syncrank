import { useState } from 'react'
import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'

export default function OnboardPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ campus: '', email: '', size: '' })

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">onboard your campus</div>
          <h2 className="sec-title">Bring SyncRank to your campus</h2>
          <p className="sec-sub">
            For placement cells and CS department admins. Fill this in and we'll set up a campus
            leaderboard and send admin access to the email below — usually within a couple of
            business days.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="form-card">
            {sent ? (
              <div className="form-success">
                <div className="form-success-mark">✓</div>
                <h4>Request received</h4>
                <p>We'll email you once the campus board is set up.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <label htmlFor="campus">Campus name</label>
                  <input id="campus" name="campus" type="text" required value={form.campus} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <label htmlFor="email">Admin email</label>
                  <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <label htmlFor="size">Approx. student count</label>
                  <input id="size" name="size" type="number" min="1" required value={form.size} onChange={handleChange} />
                </div>
                <button type="submit" className="btn-primary">
                  Request access
                </button>
              </form>
            )}
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
