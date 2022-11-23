// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingCountQueryAttributes from '../../types/actionAttributes/thingCountQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeThingCountQueryArgs', () => {
  test('should compose things query without indexed fields', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      `query Home_ExampleCount($where: ExampleWhereInput) {
  ExampleCount(where: $where)
}`,
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingCountQueryAttributes, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExampleWhereInput and ExampleSortInput args', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const expectedResult = [
      `query Home_ExampleCount($where: ExampleWhereInput) {
  ExampleCount(where: $where)
}`,
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingCountQueryAttributes, {});
    expect(result).toEqual(expectedResult);
  });
});
