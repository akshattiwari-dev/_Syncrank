import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

export default function MobileDrawer({ links, moreLinks = [], open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="mobile-drawer open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            className="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="drawer-head">
              <div className="brand" style={{ fontSize: 17 }}>
                SyncRank
              </div>
              <button className="drawer-close" onClick={onClose}>
                ✕
              </button>
            </div>

            {links.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
              >
                <NavLink to={link.to} end={link.end} className="drawer-link" onClick={onClose}>
                  {link.label}
                </NavLink>
              </motion.div>
            ))}

            {moreLinks.length > 0 && (
              <>
                <div className="drawer-divider mono">more</div>
                {moreLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (links.length + i) * 0.04, duration: 0.3 }}
                  >
                    <NavLink to={link.to} className="drawer-link drawer-link-sub" onClick={onClose}>
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </>
            )}

            <NavLink to="/dashboard" className="btn-primary drawer-cta" onClick={onClose}>
              Join your campus
            </NavLink>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
