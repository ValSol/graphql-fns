// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import deleteThingMutationAttributes from '../../types/actionAttributes/deleteThingMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

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

    const result = composeActionArgs(prefixName, thingConfig, deleteThingMutationAttributes);
    expect(result).toEqual(expectedResult);
  });
});
