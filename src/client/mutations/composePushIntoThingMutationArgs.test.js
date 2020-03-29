// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composePushIntoThingMutationArgs from './composePushIntoThingMutationArgs';

describe('composePushIntoThingMutationArgs', () => {
  test('should compose pushIntoThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation pushIntoExample($whereOne: ExampleWhereOneInput!, $data: PushIntoExampleInput!) {',
      '  pushIntoExample(whereOne: $whereOne, data: $data) {',
    ];

    const result = composePushIntoThingMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
