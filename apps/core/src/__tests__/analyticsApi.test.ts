/**
 * @jest-environment node
 */
import handler from '../pages/api/analytics'
import * as logger from '../../../../lib/logger'

jest.mock('../../../../lib/logger', () => ({
  logAnalytics: jest.fn()
}))
import type { NextApiRequest, NextApiResponse } from 'next'

describe('analytics API', () => {
  it('does not log when ANALYTICS_DISABLED is true', () => {
    const req = { body: { foo: 'bar' } } as NextApiRequest
    const json = jest.fn()
    const res = { status: jest.fn().mockReturnThis(), json } as unknown as NextApiResponse
    process.env.ANALYTICS_DISABLED = 'true'

    handler(req, res)

    expect(logger.logAnalytics).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    delete process.env.ANALYTICS_DISABLED
  })
})
