import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = true, ...rest }) {
  // Stable per-card tilt direction, picked once on mount — not on every hover.
  const tilt = useRef((Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.5))

  return (
    <motion.div
      className={`card ${className}`.trim()}
      whileHover={
        hover
          ? { y: -4, rotate: tilt.current, transition: { type: 'spring', stiffness: 300, damping: 18 } }
          : undefined
      }
      {...rest}
    >
      <span className="card-grain" aria-hidden="true" />
      {children}
    </motion.div>
  )
}
