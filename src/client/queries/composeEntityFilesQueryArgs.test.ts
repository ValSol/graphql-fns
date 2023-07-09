/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityFilesQueryAttributes from '../../types/actionAttributes/entityFilesQueryAttributes';
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
      'query Home_TangibleImageFiles($where: FileWhereInput, $token: String) {',
      '  TangibleImageFiles(where: $where, token: $token) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entityFilesQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
