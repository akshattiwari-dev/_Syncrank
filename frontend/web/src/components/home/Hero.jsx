import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: 'easeOut' },
})

export default function Hero() {
  return (
    <header className="hero hero-compact">
      <div className="hero-inner">
        <motion.div className="hero-badge" {...fadeUp(0)}>
          Codeforces + LeetCode
        </motion.div>

        <motion.h1 className="hero-title hero-title-compact" {...fadeUp(0.04)}>
          Campus rankings from Codeforces + LeetCode
        </motion.h1>

        <motion.p className="hero-sub hero-sub-compact" {...fadeUp(0.08)}>
          One score · your campus first · global always visible
        </motion.p>

        <motion.div className="hero-ctas hero-ctas-compact" {...fadeUp(0.12)}>
          <Link className="btn-primary" to="/dashboard">
            Link your handles
          </Link>
          <Link className="btn-ghost" to="/leaderboards">
            View leaderboard
          </Link>
        </motion.div>

        <motion.div className="hero-freshness mono" {...fadeUp(0.16)}>
          last synced 4m ago
        </motion.div>
      </div>
    </header>
  )
}
