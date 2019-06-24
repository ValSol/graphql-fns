// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeDeleteThingMutationArgs from './composeDeleteThingMutationArgs';

describe('composeDeleteThingMutationArgs', () => {
  test('should compose deleteThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation deleteExample($whereOne: ExampleWhereOneInput!) {',
      '  deleteExample(whereOne: $whereOne) {',
    ];

    const result = composeDeleteThingMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
