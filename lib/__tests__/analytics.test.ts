/**
 * @jest-environment node
 */
import { logEvent } from '../analytics'

describe('logEvent', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({})) as any
  })

  afterEach(() => {
    delete process.env.ANALYTICS_DISABLED
    delete process.env.NEXT_PUBLIC_ANALYTICS_DISABLED
    ;(global.fetch as jest.Mock).mockReset()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('skips sending when ANALYTICS_DISABLED is true', async () => {
    process.env.ANALYTICS_DISABLED = 'true'
    await logEvent('test', 'ev')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('skips sending when NEXT_PUBLIC_ANALYTICS_DISABLED is true', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_DISABLED = 'true'
    await logEvent('test', 'ev')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
