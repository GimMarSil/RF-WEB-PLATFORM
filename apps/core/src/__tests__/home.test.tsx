import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

jest.mock('@azure/msal-react', () => ({
  useMsal: () => ({ instance: { loginRedirect: jest.fn(), getActiveAccount: () => undefined } }),
  useIsAuthenticated: () => false
}))

jest.mock('next/router', () => ({
  useRouter: () => ({ replace: jest.fn() })
}))

describe('Core Home', () => {
  it('shows Bem-vindo ao Core', () => {
    render(<Home />)
    expect(screen.getByText('Bem-vindo ao Core')).toBeInTheDocument()
  })
})
