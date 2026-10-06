import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../../test-utils/render.jsx'
import LoginPage from '../LoginPage.jsx'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../AuthProvider.jsx', () => {
  class ApiError extends Error {
    constructor(message) {
      super(message)
      this.name = 'ApiError'
    }
  }
  return {
    useAuth: () => ({
      login: mockLogin,
      user: null,
      status: 'anonymous',
    }),
    ApiError,
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login' }),
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockNavigate.mockReset()
  })

  it('renders email, password, and log in button', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
  })

  it('calls login and navigates on success', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)

    renderWithProviders(<LoginPage />)
    await user.type(screen.getByLabelText(/email/i), 'riya@srm.demo')
    await user.type(screen.getByLabelText(/password/i), 'NewPass123!')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('riya@srm.demo', 'NewPass123!')
      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  it('shows server error message on failed login', async () => {
    const user = userEvent.setup()
    const { ApiError } = await import('../../AuthProvider.jsx')
    mockLogin.mockRejectedValueOnce(new ApiError('Invalid email or password'))

    renderWithProviders(<LoginPage />)
    await user.type(screen.getByLabelText(/email/i), 'bad@srm.demo')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
  })
})
