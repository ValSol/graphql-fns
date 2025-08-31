/* eslint-env jest */
import type { SimplifiedInventoryOptions } from '@/tsTypes';

import subtructInventoryOptions from './subtructInventoryOptions';

describe('subtructInventoryOptions', () => {
  test('should check the simplest correct filter', () => {
    const include: SimplifiedInventoryOptions = {
      Query: { childEntities: ['A', 'B', 'C'], entities: ['D', 'E'] },
      Mutation: { updateEntity: ['A'] },
      Subscription: { updatedEntity: ['A'] },
    };
    const exclude: SimplifiedInventoryOptions = {
      Query: { childEntities: ['B'], entity: ['D', 'E'] },
      Mutation: { updateEntity: ['A'] },
      Subscription: { updatedEntity: ['A'] },
    };

    const result = subtructInventoryOptions(include, exclude);

    const expectedResult = {
      Query: { childEntities: ['A', 'C'], entities: ['D', 'E'] },
      Mutation: {},
      Subscription: {},
    };
    expect(result).toEqual(expectedResult);
  });
});
