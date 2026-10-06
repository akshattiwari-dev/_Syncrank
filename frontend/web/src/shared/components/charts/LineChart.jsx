export default function LineChart({ series, width = 500, height = 180 }) {
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <line x1="0" y1={height * 0.83} x2={width} y2={height * 0.83} stroke="var(--border)" />
      <line x1="0" y1={height * 0.55} x2={width} y2={height * 0.55} stroke="var(--border)" />
      <line x1="0" y1={height * 0.28} x2={width} y2={height * 0.28} stroke="var(--border)" />
      {series.map((s, i) => (
        <path
          key={i}
          d={s.path}
          fill="none"
          stroke={s.color}
          strokeWidth={s.width ?? 2.5}
          strokeDasharray={s.dashed ? '4 4' : undefined}
          opacity={s.opacity ?? 1}
        />
      ))}
    </svg>
  )
}
