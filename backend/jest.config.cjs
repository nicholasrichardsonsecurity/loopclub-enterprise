/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/modules/tenant/**/*.ts',
    'src/modules/companies/companies.service.ts',
    '!src/modules/tenant/decorators/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov'],
};
