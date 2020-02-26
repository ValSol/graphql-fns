// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeConcatenateThingMutationArgs from './composeConcatenateThingMutationArgs';

describe('composeConcatenateThingMutationArgs', () => {
  test('should compose concatenateThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation concatenateExample($whereOne: ExampleWhereOneInput!, $data: ExampleConcatenateInput!) {',
      '  concatenateExample(whereOne: $whereOne, data: $data) {',
    ];

    const result = composeConcatenateThingMutationArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
