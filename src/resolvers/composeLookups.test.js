// @flow
/* eslint-env jest */

import composeLookups from './composeLookups';

describe('composeLookups', () => {
  test('should return result', () => {
    const lookupsObject = { relationalField: 'Example' };

    const result = composeLookups(lookupsObject);
    const expectedResult = [
      {
        $lookup: {
          from: 'example_things',
          localField: 'relationalField',
          foreignField: '_id',
          as: 'relationalField_',
        },
      },
    ];

    expect(result).toEqual(expectedResult);
  });
});
