// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createManyThingsMutationAttributes from '../../types/actionAttributes/createManyThingsMutationAttributes';
import composeActionArgs from './composeActionArgs';

describe('composeActionArgs util', () => {
  test('should return right result', async () => {
    const prefixName = 'Home';

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          array: true,
          index: true,
          weight: 1,
        },
      ],
    };

    const result = await composeActionArgs(
      prefixName,
      thingConfig,
      createManyThingsMutationAttributes,
    );
    const expectedResult = [
      'mutation Home_createManyExamples($data: [ExampleCreateInput!]!) {',
      '  createManyExamples(data: $data) {',
    ];

    expect(result).toEqual(expectedResult);
  });
});
