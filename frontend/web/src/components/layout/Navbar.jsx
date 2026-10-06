import { useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useScrollShadow } from '../../hooks/useScrollShadow.js'
import { useOutsideClick } from '../../hooks/useOutsideClick.js'
import MobileDrawer from './MobileDrawer.jsx'
import { useAuth } from '../../auth/AuthProvider.jsx'
const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/arena', label: 'Contest Arena' },
  { to: '/practice', label: 'Practice' },
  { to: '/admin', label: 'Admin' },
]

const MORE_LINKS = [
  { to: '/skill-card', label: 'Skill Card' },
  { to: '/teams', label: 'Teams' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/mentorship', label: 'Mentorship' },
  { to: '/recruiters', label: 'Recruiters' },
]

function BrandMark({ size = 22 }) {
  return (
    <svg className="owl" width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="16" cy="20" r="11" stroke="#bd9752" strokeWidth="1.6" />
      <circle cx="26" cy="20" r="11" stroke="#bd9752" strokeWidth="1.6" fill="none" />
    </svg>
  )
}

const dropdownMotion = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.14, ease: 'easeOut' },
}

export default function Navbar() {
  const scrolled = useScrollShadow(10)
  const { user, logout } = useAuth()

  const [searchOpen, setSearchOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const searchRef = useRef(null)
  const avatarRef = useRef(null)
  const moreRef = useRef(null)

  useOutsideClick(searchRef, () => setSearchOpen(false))
  useOutsideClick(avatarRef, () => setAvatarOpen(false))
  useOutsideClick(moreRef, () => setMoreOpen(false))

  return (
    <>
      <motion.nav
        className={`main-nav${scrolled ? ' scrolled' : ''}`}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="nav-left">
          <button className="burger" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
            <span />
          </button>
          <NavLink to="/" className="brand">
            <BrandMark />
            SyncRank
          </NavLink>
        </div>

        <div className="tabs">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `tab-btn${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="tab-more-wrap" ref={moreRef}>
            <button className="tab-btn tab-more" onClick={() => setMoreOpen((v) => !v)}>
              More
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div className="avatar-menu more-menu open" {...dropdownMotion}>
                  {MORE_LINKS.map((l) => (
                    <NavLink key={l.to} to={l.to} onClick={() => setMoreOpen(false)}>
                      {l.label}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="nav-right">
          <div className="search-wrap" ref={searchRef}>
            <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen((v) => !v)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div className="search-panel open" {...dropdownMotion}>
                  <input type="text" placeholder="Search a student or campus..." autoFocus />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="icon-btn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notif-dot" />
          </button>

          <div className="nav-div" />
          <NavLink to="/dashboard" className="nav-cta">
            Join your campus
          </NavLink>

          <div className="avatar-wrap" ref={avatarRef}>
            <button className="avatar-btn" onClick={() => setAvatarOpen((v) => !v)}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>
            <AnimatePresence>
              {avatarOpen && (
                <motion.div className="avatar-menu open" {...dropdownMotion}>
                  <div className="who">
                    <b>{user?.name || 'User'}</b>
                    <span>{user?.campus?.name || 'Campus'}</span>
                  </div>
                  <NavLink to="/dashboard" onClick={() => setAvatarOpen(false)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/profile" onClick={() => setAvatarOpen(false)}>
                    My profile
                  </NavLink>
                  <NavLink to="/admin" onClick={() => setAvatarOpen(false)}>
                    Campus admin
                  </NavLink>
                  <button type="button" className="signout" onClick={async () => { await logout() 
                    setAvatarOpen(false) }}> Sign out
                    </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      <MobileDrawer links={NAV_LINKS} moreLinks={MORE_LINKS} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
