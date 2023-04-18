/* eslint-env jest */
import type { DescendantAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import entityFileCountQueryAttributes from '../../types/actionAttributes/entityFileCountQueryAttributes';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDescendantEntityFileCountQuery', () => {
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
    allow: { TangiblePhoto: ['entityFileCount'] },
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
    const result = composeCustomAction(ForCatalog, entityFileCountQueryAttributes);

    const expectedResult = {
      name: 'entityFileCountForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityFileCount')
          ? `${name}FileCountForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: () => ['FileWhereInput'],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
      type: () => 'Int!',
      // eslint-disable-next-line no-unused-vars, no-shadow
      config: (entityConfig: any, generalConfig: any) => null,
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
