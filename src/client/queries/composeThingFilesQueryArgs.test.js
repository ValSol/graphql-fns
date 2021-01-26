// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingFilesQueryArgs from './composeThingFilesQueryArgs';

describe('composeThingFileQueryArgs', () => {
  test('should compose thing query args ', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = [
      'query Home_ImageFiles($where: FileWhereInput) {',
      '  ImageFiles(where: $where) {',
    ];

    const result = composeThingFilesQueryArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
