// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createManyThingsMutationAttributes from '../../types/actionAttributes/createManyThingsMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeCreateManyThingsMutationArgs', () => {
  test('should compose createThing mutation args ', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
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
      thingConfig,
      createManyThingsMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
