import { motion, useReducedMotion } from 'framer-motion'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// Opacity-only variant for secondary lists (dense tables, feeds) — less motion, same stagger.
export const staggerItemSubtle = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

/** Wrap a list; give each child `variants={staggerItem}` to animate in sequence on scroll. */
export default function StaggerGroup({ children, className = '', ...rest }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
