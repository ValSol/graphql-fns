// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingFileCountQuery from './composeThingFileCountQuery';

describe('composeThingFileCountQuery', () => {
  test('should compose things query', () => {
    const thingConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = `query ImageFileCount($where: FileWhereInput) {
  ImageFileCount(where: $where)
}`;

    const result = composeThingFileCountQuery(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
