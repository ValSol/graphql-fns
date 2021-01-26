// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingQueryArgs from './composeThingQueryArgs';

describe('composeThingQueryArgs', () => {
  test('should compose thing query args ', () => {
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
      'query Home_Example($whereOne: ExampleWhereOneInput!) {',
      '  Example(whereOne: $whereOne) {',
    ];

    const result = composeThingQueryArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
