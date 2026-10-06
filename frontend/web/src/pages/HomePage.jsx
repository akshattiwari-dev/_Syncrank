import Hero from '../components/home/Hero.jsx'
import TrustStrip from '../components/home/TrustStrip.jsx'
import MomentumTicker from '../components/home/MomentumTicker.jsx'
import EliteColleges from '../components/home/EliteColleges.jsx'
import FeatureIntro from '../components/home/FeatureIntro.jsx'
import SyncTerminal from '../components/home/SyncTerminal.jsx'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <TrustStrip />

      <section className="section-tight">
        <div className="section-inner">
          <div className="eyebrow-quiet">last 7 days</div>
          <h2 className="sec-title sec-title-sm">Campus momentum</h2>
          <div style={{ marginTop: 14 }}>
            <MomentumTicker />
          </div>
          <EliteColleges />
        </div>
      </section>

      <section className="section-tight">
        <div className="section-inner">
          <FeatureIntro />
          <SyncTerminal />
        </div>
      </section>
    </div>
  )
}
