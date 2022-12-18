// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import entityFileCountQueryAttributes from '../actionAttributes/entityFileCountQueryAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createEntityFileCountQueryType', () => {
  test('should create query', () => {
    const entityConfig: EntityConfig = {
      name: 'TangibleExample',
      type: 'tangibleFile',
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = '  TangibleExampleFileCount(where: FileWhereInput): Int!';

    const entityTypeDic = {};

    const inputDic = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityFileCountQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create empty query', () => {
    const entityConfig: EntityConfig = {
      name: 'TangibleExample',
      type: 'tangible',
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = '';

    const entityTypeDic = {};

    const inputDic = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityFileCountQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
