/* eslint-env jest */

import resolvedInfo1 from './resolvedInfo1.json';
import resolvedInfo2 from './resolvedInfo2.json';
import resolvedInfo3 from './resolvedInfo3.json';
import resolvedInfo4 from './resolvedInfo4.json';

import getFieldArgsFromResolvedInfo from './getFieldArgsFromResolvedInfo';

describe('getFieldArgsFromResolvedInfo', () => {
  test('resolvedInfo1', () => {
    const fieldName = 'ownPostsThroughConnection';

    const result = getFieldArgsFromResolvedInfo(fieldName, resolvedInfo1 as any, []);

    const expectedResult = {
      first: 12,
      sort: {
        sortBy: ['createdAt_DESC'],
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('resolvedInfo2', () => {
    const fieldName = 'ukSummary';

    const result = getFieldArgsFromResolvedInfo(fieldName, resolvedInfo2 as any, ['edges', 'node']);

    const expectedResult = {};

    expect(result).toEqual(expectedResult);
  });

  test('resolvedInfo3', () => {
    const fieldName = 'photoHeader';

    const result = getFieldArgsFromResolvedInfo(fieldName, resolvedInfo3 as any, ['edges', 'node']);

    const expectedResult = {};

    expect(result).toEqual(expectedResult);
  });

  test('resolvedInfo4', () => {
    const fieldName = 'tels';

    const result = getFieldArgsFromResolvedInfo(fieldName, resolvedInfo4 as any, []);

    const expectedResult = { slice: 3 };

    expect(result).toEqual(expectedResult);
  });
});
