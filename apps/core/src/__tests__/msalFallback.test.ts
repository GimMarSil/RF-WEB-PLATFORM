import { jest } from '@jest/globals'

let loginMocks: jest.Mock[] = []
let configs: any[] = []

jest.mock('@azure/msal-browser', () => ({
  PublicClientApplication: jest.fn().mockImplementation((config) => {
    configs.push(config)
    const loginRedirect = loginMocks.shift() || jest.fn()
    return { loginRedirect }
  })
}))
jest.mock('@azure/msal-react', () => ({ useIsAuthenticated: () => false }))

beforeEach(() => {
  jest.resetModules()
  loginMocks = []
  configs = []
})

test('falls back to secondary provider on failure', async () => {
  loginMocks.push(jest.fn().mockRejectedValue(new Error('fail')))
  loginMocks.push(jest.fn().mockResolvedValue(undefined))

  process.env.NEXT_PUBLIC_AZURE_CLIENT_ID = 'p'
  process.env.NEXT_PUBLIC_AZURE_AUTHORITY = 'https://primary'
  process.env.NEXT_PUBLIC_REDIRECT_URI = 'http://primary'
  process.env.NEXT_PUBLIC_AZURE_B2B_CLIENT_ID = 's'
  process.env.NEXT_PUBLIC_AZURE_B2B_AUTHORITY = 'https://fallback'
  process.env.NEXT_PUBLIC_AZURE_B2B_REDIRECT_URI = 'http://fallback'

  const { loginWithFallback } = await import('../../../../lib/useRequireAuth')
  await loginWithFallback({ scopes: [] })

  expect(configs.length).toBe(2)
  expect(configs[1].auth.authority).toBe('https://fallback')
})

test('uses only primary provider when successful', async () => {
  loginMocks.push(jest.fn().mockResolvedValue(undefined))

  process.env.NEXT_PUBLIC_AZURE_CLIENT_ID = 'p'
  process.env.NEXT_PUBLIC_AZURE_AUTHORITY = 'https://primary'
  process.env.NEXT_PUBLIC_REDIRECT_URI = 'http://primary'
  delete process.env.NEXT_PUBLIC_AZURE_B2B_CLIENT_ID
  delete process.env.NEXT_PUBLIC_AZURE_B2B_AUTHORITY
  delete process.env.NEXT_PUBLIC_AZURE_B2B_REDIRECT_URI

  const { loginWithFallback } = await import('../../../../lib/useRequireAuth')
  await loginWithFallback({ scopes: [] })

  expect(configs.length).toBe(1)
})
