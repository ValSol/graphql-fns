// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingFileCountQueryType from './createThingFileCountQueryType';

describe('createThingFileCountQueryType', () => {
  test('should create query only thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      file: true,
    };
    const expectedResult = '  ExampleFileCount(where: FileWhereInput): Int!';

    const result = createThingFileCountQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
