import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 up to `target` with a slight spring overshoot —
 * it ticks past the target for a beat before settling, instead of a flat ease-out.
 * Runs once on mount (or whenever `target` changes).
 */
export function useAnimatedCounter(target, duration = 1500) {
  const [value, setValue] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    const start = performance.now()
    // back-out easing: overshoots past 1 briefly, then settles — feels springy
    // without pulling in a physics lib for a single number.
    const c1 = 1.4
    const backOut = (t) => 1 + c1 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)

    function step(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = backOut(progress)
      setValue(Math.max(0, Math.round(target * eased)))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      } else {
        setValue(target)
      }
    }

    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return value
}
