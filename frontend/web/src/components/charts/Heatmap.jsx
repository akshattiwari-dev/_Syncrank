import { useMemo } from 'react'

function cellColor(intensity) {
  if (intensity > 0.85) return 'rgba(201,162,75,0.9)'
  if (intensity > 0.65) return 'rgba(201,162,75,0.55)'
  if (intensity > 0.45) return 'rgba(92,122,140,0.4)'
  return 'rgba(255,255,255,0.05)'
}

export default function Heatmap({ weeks = 26, days = 7 }) {
  // useMemo keeps the random pattern stable across re-renders instead of
  // reshuffling on every parent update.
  const cells = useMemo(
    () => Array.from({ length: weeks * days }, () => Math.random()),
    [weeks, days]
  )

  return (
    <div className="heat-grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
      {cells.map((intensity, i) => (
        <div key={i} className="heat-cell" style={{ background: cellColor(intensity) }} />
      ))}
    </div>
  )
}
