// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingQueryArgs from './composeThingQueryArgs';

describe('composeThingQueryArgs', () => {
  test('should compose thing query args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'query Example($whereOne: ExampleWhereOneInput!) {',
      '  Example(whereOne: $whereOne) {',
    ];

    const result = composeThingQueryArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
