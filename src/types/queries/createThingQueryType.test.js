// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const createThingQueryType = require('./createThingQueryType');

describe('createThingQueryType', () => {
  test('should create query only thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '  Example(where: ExampleWhereOneInput!): Example';

    const result = createThingQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
