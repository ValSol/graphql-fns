// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeDeleteThingMutationArgs from './composeDeleteThingMutationArgs';

describe('composeDeleteThingMutationArgs', () => {
  test('should compose deleteThing mutation args ', () => {
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
      'mutation Home_deleteExample($whereOne: ExampleWhereOneInput!) {',
      '  deleteExample(whereOne: $whereOne) {',
    ];

    const result = composeDeleteThingMutationArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
