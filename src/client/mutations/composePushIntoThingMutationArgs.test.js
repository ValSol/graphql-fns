// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import pushIntoThingMutationAttributes from '../../types/actionAttributes/pushIntoThingMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composePushIntoThingMutationArgs', () => {
  test('should compose pushIntoThing mutation args ', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          array: true,
        },
      ],
    };

    const expectedResult = [
      'mutation Home_pushIntoExample($whereOne: ExampleWhereOneInput!, $data: PushIntoExampleInput!, $positions: ExamplePushPositionsInput) {',
      '  pushIntoExample(whereOne: $whereOne, data: $data, positions: $positions) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, pushIntoThingMutationAttributes);
    expect(result).toEqual(expectedResult);
  });
});
