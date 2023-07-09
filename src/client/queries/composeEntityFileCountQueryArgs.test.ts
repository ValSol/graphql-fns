/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityFileCountQueryAttributes from '../../types/actionAttributes/entityFileCountQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityFileCountQuery', () => {
  test('should compose entities query', () => {
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
      `query Home_TangibleImageFileCount($where: FileWhereInput, $token: String) {
  TangibleImageFileCount(where: $where, token: $token)
}`,
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entityFileCountQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
