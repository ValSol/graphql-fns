// @flow
/* eslint-env jest */

import composeWhereInput from './composeWhereInput';

describe('composeWhereInput', () => {
  test('should return null', () => {
    const where = undefined;

    const expectedResult = null;
    const result = composeWhereInput(where);

    expect(result).toEqual(expectedResult);
  });

  test('should return null', () => {
    const where = {};

    const expectedResult = null;
    const result = composeWhereInput(where);

    expect(result).toEqual(expectedResult);
  });

  test('should return null', () => {
    const where = {
      name: 'Вася',
      code: ['Vasya-1', 'Vasya-2', 'Vasya-3'],
    };

    const result = composeWhereInput(where);
    const expectedResult = {
      name: 'Вася',
      code: { $in: ['Vasya-1', 'Vasya-2', 'Vasya-3'] },
    };

    expect(result).toEqual(expectedResult);
  });
});
