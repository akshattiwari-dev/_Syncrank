import { motion, useReducedMotion } from 'framer-motion'

const EASES = [
  [0.16, 1, 0.3, 1],
  [0.25, 0.46, 0.45, 0.94],
  'easeOut',
]

/**
 * Fades (and optionally lifts) children into view as they cross the viewport.
 * `subtle` drops the y-offset for secondary elements — opacity only, no motion.
 * Ease is picked per-instance from a small set so reveals don't all move identically.
 */
export default function Reveal({ children, delay = 0, y = 22, subtle = false, className = '', as = 'div', style }) {
  const MotionTag = motion[as] ?? motion.div
  const prefersReducedMotion = useReducedMotion()
  const offset = subtle ? 0 : y
  const ease = EASES[Math.round(delay * 100) % EASES.length]

  if (prefersReducedMotion) {
    return (
      <MotionTag className={className} style={style}>
        {children}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: subtle ? 0.4 : 0.55, delay, ease }}
    >
      {children}
    </MotionTag>
  )
}
