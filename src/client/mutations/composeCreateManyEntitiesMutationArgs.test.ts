/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

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
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'mutation Home_createManyExamples($data: [ExampleCreateInput!]!, $token: String) {',
      '  createManyExamples(data: $data, token: $token) {',
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
