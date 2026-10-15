const CAMPUSES = ['SRM Institute', 'BITS Pilani', 'VIT Vellore', 'IIT Guwahati', 'NIT Trichy']
const MORE_COUNT = 37

export default function TrustStrip() {
  return (
    <div className="trust-strip">
      <div className="trust-inner">
        <div className="trust-label">Ranking coders at</div>
        <div className="trust-row mono">
          {CAMPUSES.join(' · ')} · +{MORE_COUNT} more campuses
        </div>
      </div>
    </div>
  )
}
