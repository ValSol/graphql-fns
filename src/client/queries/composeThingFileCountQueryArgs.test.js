// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingFileCountQueryArgs from './composeThingFileCountQueryArgs';

describe('composeThingFileCountQuery', () => {
  test('should compose things query', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = `query Home_ImageFileCount($where: FileWhereInput) {
  ImageFileCount(where: $where)
}`;

    const result = composeThingFileCountQueryArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
