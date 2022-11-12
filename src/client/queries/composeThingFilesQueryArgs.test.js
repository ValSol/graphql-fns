// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingFilesQueryAttributes from '../../types/actionAttributes/thingFilesQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeThingFileQueryArgs', () => {
  test('should compose thing query args ', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'RootImage',
      file: true,
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = [
      'query Home_RootImageFiles($where: FileWhereInput) {',
      '  RootImageFiles(where: $where) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingFilesQueryAttributes, {});
    expect(result).toEqual(expectedResult);
  });
});
