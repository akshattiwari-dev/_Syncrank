import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

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
          <div className="eyebrow-quiet">contact</div>
          <h2 className="sec-title">Get in touch</h2>
          <p className="sec-sub">
            General questions, bug reports, or a sync that's been stuck: <b>hello@syncrank.app</b>.
            Campus admins and placement cells looking to onboard a campus should use the{' '}
            <Link to="/onboard">onboarding page</Link> instead — it routes faster.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="form-card">
            {sent ? (
              <div className="form-success">
                <div className="form-success-mark">✓</div>
                <h4>Message sent</h4>
                <p>We usually reply within a couple of business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows={5} required value={form.message} onChange={handleChange} />
                </div>
                <button type="submit" className="btn-primary">
                  Send message
                </button>
              </form>
            )}
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
