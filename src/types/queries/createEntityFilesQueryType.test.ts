/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityFilesQueryAttributes from '../actionAttributes/entityFilesQueryAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createEntityFilesQueryType', () => {
  test('should create query only entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'TangibleExample',
      type: 'tangibleFile',
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { TangibleExample: entityConfig },
    };

    const expectedResult =
      '  TangibleExampleFiles(where: FileWhereInput, token: String): [TangibleExample!]!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      entityFilesQueryAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
