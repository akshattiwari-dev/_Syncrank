import Card from '../../../shared/components/Card.jsx'
import Reveal from '../../../shared/components/motion/Reveal.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'

export default function ScoringPage() {
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">scoring</div>
          <h2 className="sec-title">How Sync Score works</h2>
          <p className="sec-sub">No manual entry — just handles. Here's the full process.</p>
        </Reveal>

        <Reveal delay={0.05}>
          <HowItWorks />
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="prose-card" style={{ marginTop: 24 }}>
            <h4>The weighting, roughly</h4>
            <p>
              Codeforces rating and LeetCode solve count measure different things — contest
              performance under time pressure versus breadth of practice. Sync Score weights
              your CF rating and LC solve velocity (solves per week, not just total) so a strong
              contest record and a steady practice habit both count, instead of one drowning out
              the other.
            </p>
            <h4>Why campus rank comes first</h4>
            <p>
              Global rank is available on every board, but campus rank is the default because
              it's the comparison most people actually care about day to day. Both numbers use
              the same underlying score.
            </p>
            <h4>Sync frequency</h4>
            <p>
              Handles sync automatically overnight, and live during campus contests. If a handle
              hasn't synced in a while, the leaderboard flags it as stale rather than silently
              using old numbers.
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
