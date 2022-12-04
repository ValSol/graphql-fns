// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import entityFileQueryAttributes from '../../types/actionAttributes/entityFileQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityFileQueryArgs', () => {
  const generalConfig: GeneralConfig = {};

  test('should compose entity query args ', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'RootImage',
      type: 'tangibleFile',
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = [
      'query Home_RootImageFile($whereOne: FileWhereOneInput!) {',
      '  RootImageFile(whereOne: $whereOne) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entityFileQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
