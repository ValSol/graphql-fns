// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composePushIntoThingMutationArgs from './composePushIntoThingMutationArgs';

describe('composePushIntoThingMutationArgs', () => {
  test('should compose pushIntoThing mutation args ', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation Home_pushIntoExample($whereOne: ExampleWhereOneInput!, $data: PushIntoExampleInput!) {',
      '  pushIntoExample(whereOne: $whereOne, data: $data) {',
    ];

    const result = composePushIntoThingMutationArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
