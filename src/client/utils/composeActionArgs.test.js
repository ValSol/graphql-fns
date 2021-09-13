// @flow
/* eslint-env jest */

import createManyThingsMutationAttributes from '../../types/actionAttributes/createManyThingsMutationAttributes';
import composeActionArgs from './composeActionArgs';

describe('composeActionArgs util', () => {
  test('should return right result', async () => {
    const prefixName = 'Home';

    const thingConfig = {};

    Object.assign(thingConfig, {
      name: 'Example',
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
          config: thingConfig,
        },
      ],
    });

    const childArgs = { examples_where: 'ExampleWhereInput', examples_sort: 'ExampleSortInput' };

    const result = await composeActionArgs(
      prefixName,
      thingConfig,
      createManyThingsMutationAttributes,
      childArgs,
    );
    const expectedResult = [
      'mutation Home_createManyExamples($data: [ExampleCreateInput!]!, $examples_where: ExampleWhereInput, $examples_sort: ExampleSortInput) {',
      '  createManyExamples(data: $data) {',
    ];

    expect(result).toEqual(expectedResult);
  });
});
