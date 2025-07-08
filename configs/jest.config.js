export default {
  rootDir: '../',
  preset: 'ts-jest',
  testEnvironment: 'node', // to eliminate mongodb warnings
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: './tsconfig.json' }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // support relative .js ESM imports
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};
