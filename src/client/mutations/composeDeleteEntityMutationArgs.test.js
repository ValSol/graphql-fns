// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import deleteEntityMutationAttributes from '../../types/actionAttributes/deleteEntityMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeDeleteEntityMutationArgs', () => {
  test('should compose deleteEntity mutation args ', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation Home_deleteExample($whereOne: ExampleWhereOneInput!) {',
      '  deleteExample(whereOne: $whereOne) {',
    ];

    const result = composeActionArgs(prefixName, entityConfig, deleteEntityMutationAttributes, {});
    expect(result).toEqual(expectedResult);
  });
});
