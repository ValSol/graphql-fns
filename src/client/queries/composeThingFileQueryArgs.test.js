// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingFileQueryArgs from './composeThingFileQueryArgs';

describe('composeThingFileQueryArgs', () => {
  test('should compose thing query args ', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = [
      'query Home_ImageFile($whereOne: FileWhereOneInput!) {',
      '  ImageFile(whereOne: $whereOne) {',
    ];

    const result = composeThingFileQueryArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
