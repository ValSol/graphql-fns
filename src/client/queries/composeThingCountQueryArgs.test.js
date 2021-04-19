// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingCountQueryArgs from './composeThingCountQueryArgs';

describe('composeThingCountQueryArgs', () => {
  test('should compose things query without indexed fields', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = `query Home_ExampleCount($where: ExampleWhereInput) {
  ExampleCount(where: $where)
}`;

    const result = composeThingCountQueryArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExampleWhereInput and ExampleSortInput args', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const expectedResult = `query Home_ExampleCount($where: ExampleWhereInput) {
  ExampleCount(where: $where)
}`;

    const result = composeThingCountQueryArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
