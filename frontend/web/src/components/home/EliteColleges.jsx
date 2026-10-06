import Reveal from '../motion/Reveal.jsx'
import { eliteColleges } from '../../data/mockData.js'

export default function EliteColleges() {
  return (
    <Reveal subtle>
      <div className="colleges-strip">
        <div className="colleges-strip-label mono">Registered campuses</div>
        <div className="colleges-badges">
          {eliteColleges.map((c) => (
            <div className="college-badge" key={c.name}>
              <span className="college-badge-tier">{c.tier}</span>
              <span className="college-badge-name">{c.name}</span>
              <span className="college-badge-check" title="Verified admin account">
                ✓
              </span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  )
}
