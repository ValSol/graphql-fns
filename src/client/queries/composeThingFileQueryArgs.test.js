// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingFileQueryAttributes from '../../types/actionAttributes/thingFileQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

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

    const result = composeActionArgs(prefixName, thingConfig, thingFileQueryAttributes);
    expect(result).toEqual(expectedResult);
  });
});
