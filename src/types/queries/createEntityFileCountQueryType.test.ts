/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityFileCountQueryAttributes from '../actionAttributes/entityFileCountQueryAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createEntityFileCountQueryType', () => {
  test('should create query', () => {
    const entityConfig: EntityConfig = {
      name: 'TangibleExample',
      type: 'tangibleFile',
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { TangibleExample: entityConfig },
    };

    const expectedResult = '  TangibleExampleFileCount(where: FileWhereInput, token: String): Int!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

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

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

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
