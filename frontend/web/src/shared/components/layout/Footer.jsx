import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer>
      <div className="foot-top">
        <div className="foot-grid foot-grid-wide">
          <div className="foot-brand-col">
            <div className="brand">SyncRank</div>
            <p>Campus-first competitive programming, synced nightly from Codeforces and LeetCode.</p>
          </div>
          <div className="foot-col">
            <h5>Platform</h5>
            <Link to="/leaderboards">Leaderboards</Link>
            <Link to="/arena">Contest Arena</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/scoring">How scoring works</Link>
          </div>
          <div className="foot-col">
            <h5>For students</h5>
            <Link to="/skill-card">Skill card</Link>
            <Link to="/mock-interviews">Mock interviews</Link>
            <Link to="/practice">Practice plan</Link>
            <Link to="/teams">Team up</Link>
          </div>
          <div className="foot-col">
            <h5>Campus</h5>
            <Link to="/admin">Admin tools</Link>
            <Link to="/admin/contests/new">Create contest</Link>
            <Link to="/onboard">Onboard your campus</Link>
            <Link to="/export">Placement export</Link>
            <Link to="/tournaments">Tournaments</Link>
            <Link to="/mentorship">Alumni mentorship</Link>
          </div>
          <div className="foot-col">
            <h5>For recruiters</h5>
            <Link to="/recruiters">Recruiter portal</Link>
            <Link to="/sponsored">Sponsored contests</Link>
            <Link to="/developers">API access</Link>
            <Link to="/integrations">Bots &amp; integrations</Link>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <Link to="/about">About</Link>
            <Link to="/about">Careers</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© 2026 SyncRank</span>
        <span className="foot-signature">Unofficial campus rankings · not affiliated with Codeforces or LeetCode</span>
      </div>
    </footer>
  )
}
