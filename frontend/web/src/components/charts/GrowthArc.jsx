import { useEffect, useState } from 'react'

export default function GrowthArc({ percent = 64, size = 180 }) {
  const r = 76
  const circumference = 2 * Math.PI * r
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const id = setTimeout(() => {
      setOffset(circumference - (circumference * percent) / 100)
    }, 200)
    return () => clearTimeout(id)
  }, [percent, circumference])

  return (
    <svg width={size} height={size} viewBox="0 0 180 180">
      <circle cx="90" cy="90" r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 90 90)"
        style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)' }}
      />
    </svg>
  )
}
