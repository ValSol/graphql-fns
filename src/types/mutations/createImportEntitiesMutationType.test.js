// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import importEntitiesMutationAttributes from '../actionAttributes/importEntitiesMutationAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createImportEntitiesMutationType', () => {
  test('should create mutation import entities type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult =
      '  importExamples(file: Upload!, options: ImportOptionsInput): [Example!]!';

    const entityTypeDic = {};

    const inputDic = {};
    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      importEntitiesMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
