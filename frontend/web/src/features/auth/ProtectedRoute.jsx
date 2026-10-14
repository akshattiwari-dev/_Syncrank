import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'

export function ProtectedRoute({ children, role, allowUnverified = false }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div
        className="section-inner--tight section-inner"
        style={{ paddingTop: 80, textAlign: 'center', color: 'var(--muted)' }}
      >
        Loading...
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!allowUnverified && user && user.emailVerified === false) {
    return <Navigate to="/verify-email" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}