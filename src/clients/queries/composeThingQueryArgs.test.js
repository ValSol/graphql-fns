// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const composeThingQueryArgs = require('./composeThingQueryArgs');

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
