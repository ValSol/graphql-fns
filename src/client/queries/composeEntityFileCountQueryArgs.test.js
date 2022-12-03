// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import entityFileCountQueryAttributes from '../../types/actionAttributes/entityFileCountQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityFileCountQuery', () => {
  const generalConfig: GeneralConfig = {};

  test('should compose entities query', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'RootImage',
      type: 'file',
      textFields: [{ name: 'fileId' }, { name: 'address' }],
    };

    const expectedResult = [
      `query Home_RootImageFileCount($where: FileWhereInput) {
  RootImageFileCount(where: $where)
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
