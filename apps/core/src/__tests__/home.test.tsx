import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

jest.mock(
  '@azure/msal-react',
  () => ({
    MsalProvider: ({ children }: any) => <div>{children}</div>,
    useMsal: () => ({ instance: { loginRedirect: jest.fn(), getActiveAccount: () => undefined } }),
    useIsAuthenticated: () => false
  }),
  { virtual: true }
)

jest.mock(
  '@azure/msal-browser',
  () => ({
    PublicClientApplication: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      loginRedirect: jest.fn(),
      getActiveAccount: jest.fn()
    }))
  }),
  { virtual: true }
)

jest.mock('next/router', () => ({
  useRouter: () => ({ replace: jest.fn() })
}))

describe('Core Home', () => {
  it('shows Bem-vindo ao Core', () => {
    render(<Home />)
    expect(screen.getByText('Bem-vindo ao Core')).toBeInTheDocument()
  })
})
