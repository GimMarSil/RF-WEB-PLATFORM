import { render, screen } from '@testing-library/react'

jest.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: any) => <div>{children}</div>,
  useMsal: () => ({ instance: { getActiveAccount: jest.fn(), loginRedirect: jest.fn() } }),
  useIsAuthenticated: () => false
}), { virtual: true })
jest.mock('@azure/msal-browser', () => ({ PublicClientApplication: jest.fn() }), { virtual: true })

jest.mock('../../../lib/useAnalytics', () => ({ useAnalytics: () => {} }), { virtual: true })
jest.mock('next/router', () => ({ useRouter: () => ({ asPath: '/', events: { on: jest.fn(), off: jest.fn() } }) }))

import MyApp from '../src/pages/_app'
import Perfil from '../src/pages/perfil'

jest.mock('../src/context/FuncionarioContext', () => ({
  FuncionarioProvider: ({ children }: any) => <div>{children}</div>
}))

jest.mock('@/contexts/SelectedEmployeeContext', () => ({
  SelectedEmployeeProvider: ({ children }: any) => <div>{children}</div>
}))

describe('App layout', () => {
  it('renders navigation', () => {
    render(<MyApp Component={Perfil} pageProps={{}} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('RF Web')).toBeInTheDocument()
  })
})
