/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import createManyEntitiesMutationAttributes from '../../types/actionAttributes/createManyEntitiesMutationAttributes';
import composeActionArgs from './composeActionArgs';

describe('composeActionArgs util', () => {
  test('should return right result', () => {
    const prefixName = 'Home';

    const entityConfig = {} as EntityConfig;

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          array: true,
          index: true,
          weight: 1,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'examples',
          array: true,
          config: entityConfig,
          type: 'relationalFields',
        },
      ],
    });

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const childArgs = { examples_where: 'ExampleWhereInput', examples_sort: 'ExampleSortInput' };

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      createManyEntitiesMutationAttributes,
      childArgs,
    );
    const expectedResult = [
      'mutation Home_createManyExamples($data: [ExampleCreateInput!]!, $examples_where: ExampleWhereInput, $examples_sort: ExampleSortInput) {',
      '  createManyExamples(data: $data) {',
    ];

    expect(result).toEqual(expectedResult);
  });
});
