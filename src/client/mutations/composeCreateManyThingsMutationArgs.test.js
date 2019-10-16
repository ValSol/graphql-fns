// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeCreateThingMutationArgs from './composeCreateManyThingsMutationArgs';

describe('composeCreateManyThingsMutationArgs', () => {
  test('should compose createThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation createManyExamples($data: [ExampleCreateInput!]!) {',
      '  createManyExamples(data: $data) {',
    ];

    const result = composeCreateThingMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
