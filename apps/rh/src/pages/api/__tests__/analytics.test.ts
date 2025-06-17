/** @jest-environment node */
import handler from '../analytics'
import { logAnalytics } from '../../../../../../lib/logger'

jest.mock('../../../../../../lib/logger', () => ({
  logAnalytics: jest.fn()
}))

describe('analytics API', () => {
  it('logs payload for rh', () => {
    const req = { method: 'POST', body: { foo: 'bar' } } as any
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any

    handler(req, res)

    expect(logAnalytics).toHaveBeenCalledWith('rh', req.body)
  })
})
