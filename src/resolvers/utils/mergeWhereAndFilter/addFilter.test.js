// @flow
/* eslint-env jest */

// import type { EntityConfig } from '../flowTypes';

import addFilter from './addFilter';

describe('addFilter', () => {
  test('filter empty', () => {
    const filter = [];
    const where = { id: '12345' };

    const result = addFilter(filter, where);

    const expectedResult = where;

    expect(result).toEqual(expectedResult);
  });

  test('filter with one item & empty where', () => {
    const filter = [{ editors: '98765' }];
    const where = {};

    const result = addFilter(filter, where);

    const expectedResult = filter[0];

    expect(result).toEqual(expectedResult);
  });

  test('filter with more than one item & empty where', () => {
    const filter = [{ editors: '98765' }, { creator: '98765' }];
    const where = {};

    const result = addFilter(filter, where);

    const expectedResult = { OR: filter };

    expect(result).toEqual(expectedResult);
  });

  test('filter with one item & not empty where', () => {
    const filter = [{ editors: '98765' }];
    const where = { id: '12345' };

    const result = addFilter(filter, where);

    const expectedResult = { AND: [where, filter[0]] };

    expect(result).toEqual(expectedResult);
  });

  test('filter with more than one item & not empty where', () => {
    const filter = [{ editors: '98765' }, { creator: '98765' }];
    const where = { id: '12345' };

    const result = addFilter(filter, where);

    const expectedResult = { AND: [where, { OR: filter }] };

    expect(result).toEqual(expectedResult);
  });

  test('filter with one item & not empty where', () => {
    const filter = [{ editors: '98765' }];
    const where = undefined;

    const result = addFilter(filter, where);

    const expectedResult = filter[0];

    expect(result).toEqual(expectedResult);
  });

  test('filter with one item & not empty where', () => {
    const filter = [{ editors: '98765' }, { creator: '98765' }];
    const where = undefined;

    const result = addFilter(filter, where);

    const expectedResult = { OR: filter };

    expect(result).toEqual(expectedResult);
  });
});
