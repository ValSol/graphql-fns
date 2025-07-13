// const { defaults: tsjPreset } = require('ts-jest/presets');

export default {
  rootDir: '../',
  preset: '@shelf/jest-mongodb', // uses custom testEnvironment
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: './tsconfig.json' }],
  },
  testEnvironment: 'node', // this overrides the mongodb env if you don't want it; otherwise, omit
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['<rootDir>/src/**/*.mtest.ts'],
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: './tsconfig.json' }],
  },
};
