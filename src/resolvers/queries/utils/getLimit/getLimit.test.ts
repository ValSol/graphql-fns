/* eslint-env jest */

import getLimit from './index';

describe('getLimit util', () => {
  test('get results for limit = Infinity, first = undefined', () => {
    const limit = Infinity;
    const first = undefined;

    const expectedResult = 0;

    const result = getLimit(limit, first);

    expect(result).toEqual(expectedResult);
  });

  test('get results for limit = Infinity, first = 5', () => {
    const limit = Infinity;
    const first = 5;

    const expectedResult = 5;

    const result = getLimit(limit, first);

    expect(result).toEqual(expectedResult);
  });

  test('get results for limit = 5, first = undefined', () => {
    const limit = 5;
    const first = undefined;

    const expectedResult = 5;

    const result = getLimit(limit, first);

    expect(result).toEqual(expectedResult);
  });

  test('get results for limit = 5, first = 50', () => {
    const limit = 5;
    const first = 50;

    const expectedResult = 5;

    const result = getLimit(limit, first);

    expect(result).toEqual(expectedResult);
  });

  test('get results for limit = 50, first = 5', () => {
    const limit = 50;
    const first = 5;

    const expectedResult = 5;

    const result = getLimit(limit, first);

    expect(result).toEqual(expectedResult);
  });
});
