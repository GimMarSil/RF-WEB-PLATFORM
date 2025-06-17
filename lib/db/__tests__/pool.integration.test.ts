/**
 * @jest-environment node
 */
import { executeQuery, executeTransaction } from '../pool'

const TABLE = 'integration_test_numbers'

beforeAll(async () => {
  await executeQuery(`CREATE TABLE IF NOT EXISTS ${TABLE} (value INT)`)
  await executeQuery(`TRUNCATE TABLE ${TABLE}`)
})

afterAll(async () => {
  await executeQuery(`DROP TABLE IF EXISTS ${TABLE}`)
})

describe('executeQuery', () => {
  it('runs a simple select', async () => {
    const result = await executeQuery<{ result: number }>('SELECT 1 + 1 AS result')
    expect(result[0].result).toBe(2)
  })
})

describe('executeTransaction', () => {
  beforeEach(async () => {
    await executeQuery(`TRUNCATE TABLE ${TABLE}`)
  })

  it('commits the transaction', async () => {
    await executeTransaction(async (client) => {
      await executeQuery(`INSERT INTO ${TABLE} (value) VALUES ($1)`, [42], client)
    })
    const rows = await executeQuery<{ value: number }>(`SELECT value FROM ${TABLE}`)
    expect(rows).toEqual([{ value: 42 }])
  })

  it('rolls back on error', async () => {
    await expect(
      executeTransaction(async (client) => {
        await executeQuery(`INSERT INTO ${TABLE} (value) VALUES ($1)`, [7], client)
        throw new Error('fail')
      })
    ).rejects.toThrow('fail')
    const rows = await executeQuery<{ value: number }>(`SELECT value FROM ${TABLE} WHERE value = 7`)
    expect(rows.length).toBe(0)
  })
})
