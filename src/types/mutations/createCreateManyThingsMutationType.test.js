// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createCreateManyThingsMutationType from './createCreateManyThingsMutationType';

describe('createCreateManyThingsMutationType', () => {
  test('should create mutation add thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '  createManyExamples(data: [ExampleCreateInput!]!): [Example!]!';

    const result = createCreateManyThingsMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
