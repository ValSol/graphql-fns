/* eslint-env jest */
import type { DescendantAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import entityFileQueryAttributes from '../../types/actionAttributes/entityFileQueryAttributes';
import composeDescendantConfigByName from '../composeDescendantConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDescendantEntityFileQuery', () => {
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
    allow: { TangiblePhoto: ['entityFile'] },
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
    const result = composeCustomAction(ForCatalog, entityFileQueryAttributes);

    const expectedResult = {
      name: 'entityFileForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityFile')
          ? `${name}FileForCatalog`
          : '',
      argNames: () => ['whereOne'],
      argTypes: () => ['FileWhereOneInput!'],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
      type: ({ name }: any) => `${name}ForCatalog!`,
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
