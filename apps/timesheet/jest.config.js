const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: __dirname })

const customConfig = {
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@RFWebApp/ui(.*)$': '<rootDir>/../../packages/ui/src$1',
    '^../../../lib/(.*)$': '<rootDir>/../../lib/$1'
  }
}

module.exports = createJestConfig(customConfig)
