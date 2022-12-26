// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import entityFileQueryAttributes from '../../types/actionAttributes/entityFileQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityFileQueryArgs', () => {
  test('should compose entity query args ', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'TangibleImage',
      type: 'tangibleFile',
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { TangibleImage: entityConfig } };

    const expectedResult = [
      'query Home_TangibleImageFile($whereOne: FileWhereOneInput!) {',
      '  TangibleImageFile(whereOne: $whereOne) {',
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
