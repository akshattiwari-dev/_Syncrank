import { Link } from 'react-router-dom'
import Reveal from '../motion/Reveal.jsx'

const BLOCKS = [
  { title: 'Contest rating, respected', color: 'var(--rust)' },
  { title: 'Solve breadth, counted', color: 'var(--amber)' },
  { title: 'Campus-first ranking', color: 'var(--slate)' },
]

export default function FeatureIntro() {
  return (
    <div className="feature-strip">
      {BLOCKS.map((b, i) => (
        <Reveal key={b.title} className="feature-strip-item" delay={0.03 * i} subtle>
          <span className="feature-dot" style={{ background: b.color }} />
          {b.title}
        </Reveal>
      ))}
      <Link to="/scoring" className="feature-strip-link mono">
        How Sync Score is calculated →
      </Link>
    </div>
  )
}
