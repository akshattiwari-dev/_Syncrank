import Card from '../components/shared/Card.jsx'
import Reveal from '../components/motion/Reveal.jsx'

export default function SkillCardPage() {
  return (
    <section style={{ paddingTop: 40 }}>
      <div className="section-inner--tight section-inner">
        <Reveal>
          <div className="eyebrow-quiet">skill card</div>
          <h2 className="sec-title">Your shareable coding resume</h2>
          <p className="sec-sub">
            One card, generated from your synced CF + LC data. Built to paste into a LinkedIn post
            or attach to an application — not a replacement for your resume, a supplement to it.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="skillcard" hover={false}>
            <div className="skillcard-head">
              <div className="skillcard-avatar">R</div>
              <div>
                <div className="skillcard-name">Riya Kulkarni</div>
                <div className="skillcard-sub mono">SRM Institute · CSE 2026</div>
              </div>
              <div className="skillcard-score">
                <div className="v mono">982</div>
                <div className="l">Sync Score</div>
              </div>
            </div>
            <div className="skillcard-stats">
              <div className="skillcard-stat">
                <div className="v mono">1732</div>
                <div className="l">CF rating</div>
              </div>
              <div className="skillcard-stat">
                <div className="v mono">611</div>
                <div className="l">LC solved</div>
              </div>
              <div className="skillcard-stat">
                <div className="v mono">#3</div>
                <div className="l">campus rank</div>
              </div>
              <div className="skillcard-stat">
                <div className="v mono">41</div>
                <div className="l">day streak</div>
              </div>
            </div>
            <div className="skillcard-tags">
              {['Dynamic Programming', 'Graphs', 'Segment Trees', 'Binary Search'].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="skillcard-foot mono">syncrank.app/riyak · verified from public CF/LC data</div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="hero-ctas" style={{ marginTop: 20 }}>
            <button type="button" className="btn-primary">
              Download as image
            </button>
            <button type="button" className="btn-ghost">
              Copy link
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
