// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createPaginationInputType from './createPaginationInputType';

describe('createPaginationInputType', () => {
  test('should create empty string if there are not pagination', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };

    const expectedResult = ['PaginationInput', '', {}];

    const result = createPaginationInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create pageInputType string if there are pagination', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      pagination: true,
    };

    const expectedResult = [
      'PaginationInput',
      `input PaginationInput {
  skip: Int
  first: Int
}`,
      {},
    ];

    const result = createPaginationInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
