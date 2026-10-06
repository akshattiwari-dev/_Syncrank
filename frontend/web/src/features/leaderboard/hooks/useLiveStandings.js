import { useEffect, useState } from 'react'

/**
 * Simulates a live-scoring feed: every `intervalMs`, one random entry's
 * score bumps up, and the list is re-sorted — standing in for a real
 * WebSocket/subscription feed from the contest judge. Each row carries
 * `lastDelta` (the change from the most recent tick, or 0 if unchanged)
 * so the UI can show a real number instead of a static "live" label.
 */
export function useLiveStandings(initialData, intervalMs = 4000) {
  const [standings, setStandings] = useState(initialData.map((s) => ({ ...s, lastDelta: 0 })))

  useEffect(() => {
    const id = setInterval(() => {
      setStandings((prev) => {
        const next = prev.map((s) => ({ ...s, lastDelta: 0 }))
        const i = Math.floor(Math.random() * next.length)
        const bump = 15 + Math.floor(Math.random() * 65)
        next[i].score += bump
        next[i].lastDelta = bump
        return next.sort((a, b) => b.score - a.score)
      })
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return standings
}
