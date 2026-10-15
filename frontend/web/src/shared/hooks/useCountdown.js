import { useEffect, useState } from 'react'

/** Ticks down from `initialSeconds`. Re-syncs when initialSeconds changes. */
export function useCountdown(initialSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    setSecondsLeft(Math.max(0, initialSeconds || 0))
  }, [initialSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft > 0])

  const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0')
  const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0')
  const s = String(secondsLeft % 60).padStart(2, '0')

  return { secondsLeft, label: `${h}:${m}:${s}` }
}