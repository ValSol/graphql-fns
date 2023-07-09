/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityFileQueryAttributes from '../../types/actionAttributes/entityFileQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityFileQueryArgs', () => {
  test('should compose entity query args ', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'TangibleImage',
      type: 'tangibleFile',
      textFields: [
        { name: 'fileId', type: 'textFields' },
        { name: 'address', type: 'textFields' },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { TangibleImage: entityConfig } };

    const expectedResult = [
      'query Home_TangibleImageFile($whereOne: FileWhereOneInput!, $token: String) {',
      '  TangibleImageFile(whereOne: $whereOne, token: $token) {',
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
