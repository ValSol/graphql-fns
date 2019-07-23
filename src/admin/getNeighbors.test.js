// @flow
/* eslint-env jest */

import getNeighbors from './getNeighbors';

describe('getNeighbors', () => {
  const items = [{ id: '1' }, { id: '2' }, { id: '3' }];

  test('should return next id', () => {
    const id = '1';
    const expectedResult = { next: '2' };

    const result = getNeighbors(id, items);
    expect(result).toEqual(expectedResult);
  });

  test('should return previous & next ids', () => {
    const id = '2';
    const expectedResult = { previous: '1', next: '3' };

    const result = getNeighbors(id, items);
    expect(result).toEqual(expectedResult);
  });

  test('should return previous id', () => {
    const id = '3';
    const expectedResult = { previous: '2' };

    const result = getNeighbors(id, items);
    expect(result).toEqual(expectedResult);
  });

  test('should return previous id', () => {
    const id = '';
    const expectedResult = {};

    const result = getNeighbors(id, items);
    expect(result).toEqual(expectedResult);
  });
});
