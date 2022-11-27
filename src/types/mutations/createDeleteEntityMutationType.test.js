// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import deleteEntityMutationAttributes from '../actionAttributes/deleteEntityMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createDeleteEntityMutationType', () => {
  test('should create mutation delete entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult = '  deleteExample(whereOne: ExampleWhereOneInput!): Example!';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      deleteEntityMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
