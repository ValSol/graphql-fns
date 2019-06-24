// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingQueryType from './createThingQueryType';

describe('createThingQueryType', () => {
  test('should create query only thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '  Example(whereOne: ExampleWhereOneInput!): Example';

    const result = createThingQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
