/**
 * @jest-environment node
 */

import { userHasAdminRightsToManageCriteria } from '../authz'
import { pool } from '../../../../../lib/db/pool'

type MockClient = { query: jest.Mock, release: jest.Mock }

jest.mock('../../../../../lib/db/pool', () => ({
  pool: { connect: jest.fn() }
}))

const mockConnect = pool.connect as jest.Mock

describe('userHasAdminRightsToManageCriteria', () => {
  let client: MockClient

  beforeEach(() => {
    client = {
      query: jest.fn(),
      release: jest.fn()
    }
    mockConnect.mockResolvedValue(client)
  })

  it('returns true when system user has admin role', async () => {
    client.query.mockResolvedValueOnce({ rows: [{ role: 'admin' }] })
    const result = await userHasAdminRightsToManageCriteria('emp1', 'user1')
    expect(result).toBe(true)
    expect(client.query).toHaveBeenCalledTimes(1)
  })

  it('returns true when acting employee has HR role', async () => {
    client.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ role: 'hr' }] })

    const result = await userHasAdminRightsToManageCriteria('emp1', 'user1')
    expect(result).toBe(true)
    expect(client.query).toHaveBeenCalledTimes(2)
  })

  it('returns false when no roles found', async () => {
    client.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })

    const result = await userHasAdminRightsToManageCriteria('emp1', 'user1')
    expect(result).toBe(false)
  })
})
