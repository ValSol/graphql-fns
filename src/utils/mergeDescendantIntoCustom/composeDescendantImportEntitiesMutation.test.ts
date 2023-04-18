/* eslint-env jest */

import pluralize from 'pluralize';

import type { DescendantAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import importEntitiesMutationAttributes from '../../types/actionAttributes/importEntitiesMutationAttributes';
import composeDescendantConfigByName from '../composeDescendantConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDescendantImportEntitiesMutation', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        array: true,
        index: true,
        type: 'textFields',
      },
    ],
  };
  const ForCatalog: DescendantAttributes = {
    allow: { Example: ['importEntities'] },
    descendantKey: 'ForCatalog',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    },
  };

  const descendant = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    descendant,
  };

  test('should return correct descendant config', () => {
    const result = composeCustomAction(ForCatalog, importEntitiesMutationAttributes);

    const expectedResult = {
      name: 'importentitiesForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('importEntities')
          ? `import${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['file', 'options'],
      argTypes: () => ['Upload!', 'ImportOptionsInput'],
      involvedEntityNames: ({ name }: any) => ({
        inputOutputEntity: `${name}ForCatalog`,
      }),
      type: ({ name }: any) => `[${name}ForCatalog!]!`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeDescendantConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeCustomActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeCustomActionSignature(
      expectedResult,
      entityConfig,
      generalConfig,
    );

    expect(result2).toEqual(expectedResult2);

    expect(result.involvedEntityNames(entityConfig, generalConfig)).toEqual(
      expectedResult.involvedEntityNames(entityConfig),
    );

    expect(result.config(entityConfig, generalConfig)).toEqual(
      expectedResult.config(entityConfig, generalConfig),
    );
  });
});
