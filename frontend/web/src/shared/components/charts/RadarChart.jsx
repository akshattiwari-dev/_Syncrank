const AXES = ['Depth', 'Breadth', 'Contests', 'Streaks', 'Growth']

function point(cx, cy, r, i, n, val) {
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2
  return [cx + Math.cos(angle) * r * val, cy + Math.sin(angle) * r * val]
}

export default function RadarChart({ seriesA, seriesB, colorA = 'var(--gold)', colorB = 'var(--rust)' }) {
  const cx = 200
  const cy = 140
  const r = 100
  const n = AXES.length

  function polygonPoints(values, val) {
    let pts = ''
    for (let i = 0; i < n; i++) {
      const [x, y] = point(cx, cy, r, i, n, val ?? values[i])
      pts += `${x},${y} `
    }
    return pts
  }

  return (
    <svg width="100%" height="280" viewBox="0 0 400 280">
      {[1, 2, 3, 4].map((ring) => (
        <polygon key={ring} points={polygonPoints(null, ring / 4)} fill="none" stroke="rgba(255,255,255,0.07)" />
      ))}
      {AXES.map((label, i) => {
        const [x, y] = point(cx, cy, r, i, n, 1)
        const [lx, ly] = point(cx, cy, r, i, n, 1.18)
        return (
          <g key={label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" />
            <text x={lx} y={ly} fill="#9A968C" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">
              {label}
            </text>
          </g>
        )
      })}
      <polygon points={polygonPoints(seriesB)} fill="rgba(193,87,63,0.10)" stroke={colorB} strokeWidth="2" />
      <polygon points={polygonPoints(seriesA)} fill="rgba(201,162,75,0.14)" stroke={colorA} strokeWidth="2" />
    </svg>
  )
}
