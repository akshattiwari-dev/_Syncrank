import Card from '../../../../shared/components/Card.jsx'
import { motion } from 'framer-motion'
import { momentumData } from '../../../../shared/data/mockData.js'

// Hand-tuned, not perfectly even — real momentum doesn't arrive on a metronome.
const JITTER = [0, 0.08, 0.13, 0.24, 0.29, 0.4, 0.46, 0.53]

export default function MomentumTicker() {
  return (
    <Card className="momentum" hover={false}>
      <div className="momentum-head">
        <h3>Weekly Momentum</h3>
        <div className="live-tag">
          <span className="pulse-dot" />
          LIVE
        </div>
      </div>
      <div>
        {momentumData.map((m, i) => {
          const isUp = m.delta.startsWith('+')
          const isFlat = m.delta === '0'
          return (
            <motion.div
              className="mv-row"
              key={m.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: JITTER[i % JITTER.length] }}
            >
              <div className="mv-rank">{i + 1}</div>
              <div className="mv-name">
                {m.name}
                <span>{m.sub}</span>
              </div>
              <div className="mv-score mono">{m.score.toLocaleString()}</div>
              <div className={`mv-delta ${isFlat ? 'flat' : isUp ? 'up' : 'down'}`}>
                {isFlat ? '·' : isUp ? '↑' : '↓'} {m.delta.replace(/[+-]/, '')}
              </div>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}
