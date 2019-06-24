// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeCreateThingMutationArgs from './composeCreateThingMutationArgs';

describe('composeCreateThingMutationArgs', () => {
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
      'mutation createExample($data: ExampleCreateInput!) {',
      '  createExample(data: $data) {',
    ];

    const result = composeCreateThingMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
