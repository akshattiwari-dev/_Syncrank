import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '../../shared/api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'authenticated' | 'anonymous'

  const bootstrap = useCallback(async () => {
    try {
      const me = await api.get('/auth/me')
      setUser(me)
      setStatus('authenticated')
        } catch {
      // 401 here just means "not logged in" — not an error state worth
      // surfacing to the user.
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  async function login(email, password) {
    const result = await api.post('/auth/login', { email, password })
    await bootstrap()
    return result
  }

  async function register(input) {
    const result = await api.post('/auth/register', input)
    await bootstrap()
    return result
  }

  async function logout() {
    await api.post('/auth/logout')
    setUser(null)
    setStatus('anonymous')
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, refresh: bootstrap }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export { ApiError }
