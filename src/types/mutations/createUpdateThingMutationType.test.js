// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const createUpdateThingMutationType = require('./createUpdateThingMutationType');

describe('createUpdateThingMutationType', () => {
  test('should create mutation update thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult =
      '  updateExample(where: ExampleWhereOneInput! data: ExampleUpdateInput!): Example!';

    const result = createUpdateThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
