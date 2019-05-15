// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const composDeleteThingMutationArgs = require('./composDeleteThingMutationArgs');

describe('composDeleteThingMutationArgs', () => {
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

    const result = composDeleteThingMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
