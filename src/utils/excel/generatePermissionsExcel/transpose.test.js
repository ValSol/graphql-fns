// @flow
/* eslint-env jest */

import transpose from './transpose';

describe('transpose util', () => {
  test('should return transponsed matrix', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
    ];

    const expectedResult = [
      [1, 4],
      [2, 5],
      [3, 6],
    ];

    const result = transpose(matrix);

    expect(result).toEqual(expectedResult);
  });
});
