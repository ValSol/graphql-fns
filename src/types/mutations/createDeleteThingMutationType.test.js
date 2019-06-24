// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createDeleteThingMutationType from './createDeleteThingMutationType';

describe('createDeleteThingMutationType', () => {
  test('should create mutation delete thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '  deleteExample(whereOne: ExampleWhereOneInput!): Example';

    const result = createDeleteThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
