// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import createPaginationInputType from './createPaginationInputType';

describe('createPaginationInputType', () => {
  test('should create pageInputType string if there are pagination', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };

    const expectedResult = [
      'PaginationInput',
      `input PaginationInput {
  skip: Int
  first: Int
}`,
      {},
    ];

    const result = createPaginationInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
