module.exports = {
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  testEnvironment: '<rootDir>/test/mongo-environment.js',
  testMatch: ['<rootDir>/**/*.mtest.js'],
  globalTeardown: '<rootDir>/test/teardown.js',
};
