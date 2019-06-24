// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeUpdateThingMutationArgs from './composeUpdateThingMutationArgs';

describe('composeUpdateThingMutationArgs', () => {
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
      'mutation updateExample($whereOne: ExampleWhereOneInput!, $data: ExampleUpdateInput!) {',
      '  updateExample(whereOne: $whereOne, data: $data) {',
    ];

    const result = composeUpdateThingMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
