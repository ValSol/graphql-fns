// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingFileQueryType from './createThingFileQueryType';

describe('createThingFileQueryType', () => {
  test('should create query only thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      file: true,
    };
    const expectedResult = '  ExampleFile(whereOne: FileWhereOneInput!): Example';

    const result = createThingFileQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
