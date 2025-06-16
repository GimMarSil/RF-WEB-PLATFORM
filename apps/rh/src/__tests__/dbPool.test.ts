jest.mock('pg', () => {
  const mPool = { on: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
})

import pool from '../lib/dbPool'
import { Pool } from 'pg'

describe('dbPool module', () => {
  it('creates a single Pool instance', () => {
    expect(Pool).toHaveBeenCalledTimes(1)
    expect(pool).toBeDefined()
  })
})
