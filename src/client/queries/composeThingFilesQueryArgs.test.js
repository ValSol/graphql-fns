// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingFilesQueryArgs from './composeThingFilesQueryArgs';

describe('composeThingFileQueryArgs', () => {
  test('should compose thing query args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = [
      'query ImageFiles($where: FileWhereInput) {',
      '  ImageFiles(where: $where) {',
    ];

    const result = composeThingFilesQueryArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
