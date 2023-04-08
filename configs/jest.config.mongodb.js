const { defaults: tsjPreset } = require('ts-jest/presets'); // eslint-disable-line import/no-extraneous-dependencies

module.exports = {
  rootDir: '../',
  transform: tsjPreset.transform,
  preset: '@shelf/jest-mongodb',
  testMatch: ['<rootDir>/**/*.mtest.ts'],
  testTimeout: 30000,
};
