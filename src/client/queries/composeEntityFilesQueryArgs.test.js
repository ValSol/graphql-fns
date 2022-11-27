// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import entityFilesQueryAttributes from '../../types/actionAttributes/entityFilesQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityFileQueryArgs', () => {
  test('should compose entity query args ', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'RootImage',
      type: 'file',
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = [
      'query Home_RootImageFiles($where: FileWhereInput) {',
      '  RootImageFiles(where: $where) {',
    ];

    const result = composeActionArgs(prefixName, entityConfig, entityFilesQueryAttributes, {});
    expect(result).toEqual(expectedResult);
  });
});
