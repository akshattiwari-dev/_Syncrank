import { Link } from 'react-router-dom'
import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'

export default function AboutPage() {
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">about</div>
          <h2 className="sec-title">What SyncRank is</h2>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="prose-card">
            <p>
              SyncRank is a campus-first ranking tool. It pulls your Codeforces rating and your
              LeetCode solve history and reconciles them into one Sync Score, instead of leaving
              you with two separate profiles to compare by hand.
            </p>
            <p>
              Every leaderboard defaults to your own campus. Global rank is there too, but it
              isn't the first thing you see — most people care more about where they stand
              against classmates than against the entire platform.
            </p>
            <p>
              SyncRank is not affiliated with, endorsed by, or officially connected to Codeforces
              or LeetCode. Rating and solve data is pulled from their public APIs and profile
              pages on a regular sync schedule.
            </p>
            <p>
              It's built and maintained by a small team. If something looks wrong or a sync is
              stale, the <Link to="/contact">contact page</Link> is the fastest way to reach us.
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
