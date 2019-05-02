// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const createDeleteThingMutationType = require('./createDeleteThingMutationType');

describe('createDeleteThingMutationType', () => {
  test('should create mutation delete thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '  deleteExample(where: ExampleWhereOneInput!): Example';

    const result = createDeleteThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
