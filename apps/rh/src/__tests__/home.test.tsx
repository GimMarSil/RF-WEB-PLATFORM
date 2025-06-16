import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

jest.mock('@azure/msal-react', () => ({
  useMsal: () => ({ accounts: [], instance: { loginRedirect: jest.fn() }, inProgress: 'none' }),
  useIsAuthenticated: () => false
}))

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

jest.mock('gsap', () => ({
  fromTo: jest.fn()
}))

describe('RH Home', () => {
  it('shows Bem-vindo ao Portal RH', () => {
    render(<Home />)
    expect(screen.getByText('Bem-vindo ao Portal RH')).toBeInTheDocument()
  })
})
