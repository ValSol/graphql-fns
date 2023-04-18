/* eslint-env jest */
import type { DescendantAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import entityFilesQueryAttributes from '../../types/actionAttributes/entityFilesQueryAttributes';
import composeDescendantConfigByName from '../composeDescendantConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDescendantEntityFilesQuery', () => {
  const entityConfig: EntityConfig = {
    name: 'TangiblePhoto',
    type: 'tangibleFile',
    textFields: [
      {
        name: 'textField',
        index: true,
        type: 'textFields',
      },
    ],
  };
  const ForCatalog: DescendantAttributes = {
    allow: { TangiblePhoto: ['entityFiles'] },
    descendantKey: 'ForCatalog',
    addFields: {
      TangiblePhoto: {
        floatFields: [{ name: 'floatField' }],
      },
    },
  };

  const descendant = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { TangiblePhoto: entityConfig },
    descendant,
  };

  test('should return correct descendant config', () => {
    const result = composeCustomAction(ForCatalog, entityFilesQueryAttributes);

    const expectedResult = {
      name: 'entityFilesForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityFiles')
          ? `${name}FilesForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: () => ['FileWhereInput'],
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
