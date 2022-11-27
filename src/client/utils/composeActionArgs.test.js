// @flow
/* eslint-env jest */

import createManyEntitiesMutationAttributes from '../../types/actionAttributes/createManyEntitiesMutationAttributes';
import composeActionArgs from './composeActionArgs';

describe('composeActionArgs util', () => {
  test('should return right result', async () => {
    const prefixName = 'Home';

    const entityConfig = {};

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          array: true,
          index: true,
          weight: 1,
        },
      ],
      relationalFields: [
        {
          name: 'examples',
          array: true,
          config: entityConfig,
        },
      ],
    });

    const childArgs = { examples_where: 'ExampleWhereInput', examples_sort: 'ExampleSortInput' };

    const result = await composeActionArgs(
      prefixName,
      entityConfig,
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
