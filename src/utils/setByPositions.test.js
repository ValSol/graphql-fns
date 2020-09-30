// @flow
/* eslint-env jest */

import setByPositions from './setByPositions';

describe('setByPositions', () => {
  test('should return array with correct setted fields', () => {
    const arr = [
      'old-1',
      'old-2',
      'old-3',
      'old-4',
      'old1-5',
      'old-6',
      'newTo-0',
      'newTo-2',
      'newTo-3',
      'newTo-7',
    ];
    const positions = [0, 2, 3, 7];

    const expectedResult = [
      'newTo-0', // 0
      'old-1', // 1
      'newTo-2', // 2
      'newTo-3', // 3
      'old-2', // 4
      'old-3', // 5
      'old-4', // 6
      'newTo-7', // 7
      'old1-5', // 8
      'old-6', // 9
    ];
    const result = setByPositions(arr, positions);
    expect(result).toEqual(expectedResult);
  });

  test('should return array with correct setted fields', () => {
    const arr = [0, 1, 2, 3, 4, 5];
    const positions = [5, 4, 3, 2, 1, 0];

    const expectedResult = [5, 4, 3, 2, 1, 0];
    const result = setByPositions(arr, positions);
    expect(result).toEqual(expectedResult);
  });
});
