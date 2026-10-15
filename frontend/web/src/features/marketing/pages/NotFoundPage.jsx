import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <div className="notfound">
          <div className="notfound-code mono">404</div>
          <h2 className="sec-title">Page not found</h2>
          <p className="sec-sub">
            That page doesn't exist, or it moved. It happens — even sync jobs miss sometimes.
          </p>
          <div className="hero-ctas" style={{ marginTop: 24 }}>
            <Link className="btn-primary" to="/">
              Back to home
            </Link>
            <Link className="btn-ghost" to="/leaderboards">
              View leaderboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
