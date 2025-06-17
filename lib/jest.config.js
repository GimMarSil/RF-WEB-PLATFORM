module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../tsconfig.base.json'
    }
  }
}
