// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingFileCountQuery from './composeThingFileCountQuery';

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

    const result = composeThingFileCountQuery(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
