// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import createManyEntitiesMutationAttributes from '../../types/actionAttributes/createManyEntitiesMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeCreateManyEntitysMutationArgs', () => {
  test('should compose createEntity mutation args ', () => {
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
      'mutation Home_createManyExamples($data: [ExampleCreateInput!]!) {',
      '  createManyExamples(data: $data) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      createManyEntitiesMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
