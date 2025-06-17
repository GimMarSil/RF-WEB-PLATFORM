import { render, screen } from '@testing-library/react'

jest.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: any) => <div>{children}</div>,
  useMsal: () => ({ instance: { getActiveAccount: jest.fn(), loginRedirect: jest.fn() } }),
  useIsAuthenticated: () => false
}), { virtual: true })
jest.mock('@azure/msal-browser', () => ({ PublicClientApplication: jest.fn().mockImplementation(() => ({ initialize: jest.fn().mockResolvedValue(undefined) })) }), { virtual: true })
jest.mock('@lib/useAnalytics', () => ({ useAnalytics: () => {} }), { virtual: true })
jest.mock('next/router', () => ({ useRouter: () => ({ asPath: '/', events: { on: jest.fn(), off: jest.fn() } }) }))

import MyApp from '../src/pages/_app'
import Index from '../src/pages/index'

describe('App layout', () => {
  it('renders navigation', () => {
    render(<MyApp Component={Index} pageProps={{}} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('RF Web')).toBeInTheDocument()
  })
})
