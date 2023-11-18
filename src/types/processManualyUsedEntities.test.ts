/* eslint-env jest */

import type {
  DescendantAttributes,
  EntityConfig,
  GeneralConfig,
  TangibleEntityConfig,
} from '../tsTypes';

import pageInfoConfig from '../utils/composeAllEntityConfigs/pageInfoConfig';
import processManualyUsedEntities from './processManualyUsedEntities';

describe('processManualyUsedEntities', () => {
  test('should create entity type with Text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
    };
    const ForCatalog: DescendantAttributes = {
      allow: { Example: ['entity', 'entities'] },
      descendantKey: 'ForCatalog',
      addFields: {
        Example: {
          floatFields: [{ name: 'floatField' }],
        },
      },
    };

    const descendant = { ForCatalog };

    const manualyUsedEntities = [
      { name: 'Example' },
      { name: 'Example', descendantKey: 'ForCatalog' },
    ];

    const entityTypeDic = {};
    const inputDic = {};

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
      descendant,
      manualyUsedEntities,
    };

    const expectedEntityTypeDic = {
      Example: `type Example implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
}`,
      ExampleForCatalog: `type ExampleForCatalog implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  textField: String
  floatField: Float
}`,
    };

    processManualyUsedEntities(generalConfig, entityTypeDic, inputDic);

    expect(entityTypeDic).toEqual(expectedEntityTypeDic);
  });
});
