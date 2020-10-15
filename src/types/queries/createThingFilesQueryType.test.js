// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingFilesQueryType from './createThingFilesQueryType';

describe('createThingFilesQueryType', () => {
  test('should create query only thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      file: true,
    };
    const expectedResult = '  ExampleFiles(where: FileWhereInput): [Example!]!';

    const result = createThingFilesQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
