// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const composeThingCountQuery = require('./composeThingCountQuery');

describe('composeThingCountQuery', () => {
  test('should compose things query without args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = `query ExampleCount {
  ExampleCount
}`;

    const result = composeThingCountQuery(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExampleWhereInput and ExampleSortInput args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const expectedResult = `query ExampleCount($where: ExampleWhereInput) {
  ExampleCount(where: $where)
}`;

    const result = composeThingCountQuery(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
