// @flow
/* eslint-env jest */

import composeCommonUseTypes from './composeCommonUseTypes';

describe('composeCommonUseTypes', () => {
  test('should return correct string', () => {
    const expectedResult = [
      'scalar DateTime',
      `input RegExp {
  pattern: String!
  flags: String
}`,
      `input SliceInput {
  begin: Int
  end: Int
}`,
    ];

    const result = composeCommonUseTypes();
    expect(result).toEqual(expectedResult);
  });
});
