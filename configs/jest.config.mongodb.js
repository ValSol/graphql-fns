export default {
  rootDir: '../',
  preset: '@shelf/jest-mongodb', // uses custom testEnvironment
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: './tsconfig.json' }],
  },
  testEnvironment: 'node', // this overrides the mongodb env if you don't want it; otherwise, omit
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // CJS build of "graphql": under "--experimental-vm-modules" the ESM build makes a require(esm) cycle with CJS dependencies
    '^graphql$': '<rootDir>/node_modules/graphql/index.js',
    '^graphql/(.*)$': '<rootDir>/node_modules/graphql/$1.js',
  },
  testMatch: ['<rootDir>/src/**/*.mtest.ts'],
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: './tsconfig.json' }],
  },
};
