// @flow
/* eslint-env jest */
import getProjectionFromInfo from './getProjectionFromInfo';
import info from './info.auxiliary';

describe('getProjectionFromInfo', () => {
  test('should return object with fields from query info', () => {
    const result = getProjectionFromInfo(info);
    const expectedResult = { textField1: 1, textField3: 1, createdAt: 1 };
    expect(result).toEqual(expectedResult);
  });
});
