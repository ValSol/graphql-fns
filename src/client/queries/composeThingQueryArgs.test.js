// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingQueryAttributes from '../../types/actionAttributes/thingQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

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

    const result = composeActionArgs(prefixName, thingConfig, thingQueryAttributes);
    expect(result).toEqual(expectedResult);
  });
});
