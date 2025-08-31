/* eslint-env jest */
import type { SimplifiedInventoryOptions } from '../../../../tsTypes';

import addtInventoryOptions from './addtInventoryOptions';

describe('addtInventoryOptions', () => {
  test('should check the simplest correct filter', () => {
    const include: SimplifiedInventoryOptions = {
      Query: { childEntities: ['A', 'B', 'C'], entities: ['D', 'E'] },
      Mutation: { updateEntity: ['A', 'B'] },
      Subscription: { updatedEntity: ['A', 'B'] },
    };
    const exclude: SimplifiedInventoryOptions = {
      Query: { childEntities: ['B'], entity: ['F', 'G'] },
      Mutation: { updateEntity: ['C', 'D'] },
      Subscription: { updatedEntity: ['C', 'D'] },
    };

    const result = addtInventoryOptions(include, exclude);

    const expectedResult = {
      Query: { childEntities: ['A', 'B', 'C'], entities: ['D', 'E'], entity: ['F', 'G'] },
      Mutation: { updateEntity: ['A', 'B', 'C', 'D'] },
      Subscription: { updatedEntity: ['A', 'B', 'C', 'D'] },
    };
    expect(result).toEqual(expectedResult);
  });
});
