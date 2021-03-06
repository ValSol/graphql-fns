// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingFileCountQueryAttributes from '../../types/actionAttributes/thingFileCountQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeThingFileCountQuery', () => {
  test('should compose things query', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = [
      `query Home_ImageFileCount($where: FileWhereInput) {
  ImageFileCount(where: $where)
}`,
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingFileCountQueryAttributes);
    expect(result).toEqual(expectedResult);
  });
});
