import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import PageTransition from './components/motion/PageTransition.jsx'
import { ProtectedRoute } from './auth/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import ArenaPage from './pages/ArenaPage.jsx'
import ContestPage from './pages/ContestPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import CreateContestPage from './pages/CreateContestPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import TermsPage from './pages/TermsPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import OnboardPage from './pages/OnboardPage.jsx'
import ExportPage from './pages/ExportPage.jsx'
import ScoringPage from './pages/ScoringPage.jsx'
import SkillCardPage from './pages/SkillCardPage.jsx'
import MockInterviewsPage from './pages/MockInterviewsPage.jsx'
import PracticePage from './pages/PracticePage.jsx'
import TeamsPage from './pages/TeamsPage.jsx'
import TournamentsPage from './pages/TournamentsPage.jsx'
import MentorshipPage from './pages/MentorshipPage.jsx'
import RecruitersPage from './pages/RecruitersPage.jsx'
import SponsoredPage from './pages/SponsoredPage.jsx'
import DevelopersPage from './pages/DevelopersPage.jsx'
import IntegrationsPage from './pages/IntegrationsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'

export default function App() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />

          <Route path="/dashboard" element={<PageTransition><ProtectedRoute><DashboardPage /></ProtectedRoute></PageTransition>} />
          <Route path="/leaderboards" element={<PageTransition><ProtectedRoute><LeaderboardPage /></ProtectedRoute></PageTransition>} />
          <Route path="/arena" element={<PageTransition><ProtectedRoute><ArenaPage /></ProtectedRoute></PageTransition>} />
          <Route path="/contests/:id" element={<PageTransition><ProtectedRoute><ContestPage /></ProtectedRoute></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProtectedRoute><ProfilePage /></ProtectedRoute></PageTransition>} />
          <Route path="/admin" element={<PageTransition><ProtectedRoute role="campus_admin"><AdminPage /></ProtectedRoute></PageTransition>} />
          <Route
            path="/admin/contests/new"
            element={<PageTransition><ProtectedRoute role="campus_admin"><CreateContestPage /></ProtectedRoute></PageTransition>}
          />

          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="/onboard" element={<PageTransition><OnboardPage /></PageTransition>} />
          <Route path="/export" element={<PageTransition><ProtectedRoute role="campus_admin"><ExportPage /></ProtectedRoute></PageTransition>} />
          <Route path="/scoring" element={<PageTransition><ScoringPage /></PageTransition>} />
          <Route path="/skill-card" element={<PageTransition><ProtectedRoute><SkillCardPage /></ProtectedRoute></PageTransition>} />

          {/* Out of scope for v1 per product spec — stubs kept reachable but
              not wired to any backend; see README "Out of scope" section. */}
          <Route path="/mock-interviews" element={<PageTransition><MockInterviewsPage /></PageTransition>} />
          <Route path="/practice" element={<PageTransition><ProtectedRoute><PracticePage /></ProtectedRoute></PageTransition>} />
          <Route path="/teams" element={<PageTransition><TeamsPage /></PageTransition>} />
          <Route path="/tournaments" element={<PageTransition><TournamentsPage /></PageTransition>} />
          <Route path="/mentorship" element={<PageTransition><MentorshipPage /></PageTransition>} />
          <Route path="/recruiters" element={<PageTransition><RecruitersPage /></PageTransition>} />
          <Route path="/sponsored" element={<PageTransition><SponsoredPage /></PageTransition>} />
          <Route path="/developers" element={<PageTransition><DevelopersPage /></PageTransition>} />
          <Route path="/integrations" element={<PageTransition><IntegrationsPage /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  )
}