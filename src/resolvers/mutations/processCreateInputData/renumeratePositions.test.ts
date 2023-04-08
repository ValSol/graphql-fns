/* eslint-env jest */

import renumeratePositions from './renumeratePositions';

describe('renumeratePositions', () => {
  test('should return result for increasing positions', () => {
    const idsLength = 0;
    const createLength = 4;
    const positions = [0, 1, 2, 3];

    const expectedResult = [0, 1, 2, 3];

    const result = renumeratePositions(positions, createLength, idsLength);

    expect(result).toEqual(expectedResult);
  });

  test('should return result for decreasing positions', () => {
    const idsLength = 5;
    const createLength = 4;
    const positions = [8, 4, 2, 0];

    const expectedResult = [5, 2, 1, 0];

    const result = renumeratePositions(positions, createLength, idsLength);

    expect(result).toEqual(expectedResult);
  });

  test('should return result for decreasing positions', () => {
    const idsLength = 4;
    const createLength = 4;
    const positions = [7, 2, 4, 0];

    const expectedResult = [4, 1, 3, 0];

    const result = renumeratePositions(positions, createLength, idsLength);

    expect(result).toEqual(expectedResult);
  });

  test('should return result for decreasing positions', () => {
    const idsLength = 0;
    const createLength = 4;
    const positions = undefined;

    const expectedResult = [0, 1, 2, 3];

    const result = renumeratePositions(positions, createLength, idsLength);

    expect(result).toEqual(expectedResult);
  });

  test('should return result for decreasing positions', () => {
    const idsLength = 4;

    const positions = undefined;
    const createLength = 4;
    const expectedResult = [4, 5, 6, 7];

    const result = renumeratePositions(positions, createLength, idsLength);

    expect(result).toEqual(expectedResult);
  });
});
