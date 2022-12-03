// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import createManyEntitiesMutationAttributes from '../../types/actionAttributes/createManyEntitiesMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeCreateManyEntitysMutationArgs', () => {
  const generalConfig: GeneralConfig = {};

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
      generalConfig,
      createManyEntitiesMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
