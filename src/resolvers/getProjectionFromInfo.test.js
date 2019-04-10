// @flow
/* eslint-env jest */
const getProjectionFromInfo = require('./getProjectionFromInfo');
const info = require('./info.auxiliary.js');

describe('getProjectionFromInfo', () => {
  test('should return object with fields from query info', () => {
    const result = getProjectionFromInfo(info);
    const expectedResult = { textField1: 1, textField3: 1, createdAt: 1 };
    expect(result).toEqual(expectedResult);
  });
});
