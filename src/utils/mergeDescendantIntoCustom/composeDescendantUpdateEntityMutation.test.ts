/* eslint-env jest */
import type { DescendantAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import updateEntityMutationAttributes from '../../types/actionAttributes/updateEntityMutationAttributes';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDescendantUpdateEntityMutation', () => {
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
    allow: { Example: ['updateEntity'] },
    descendantKey: 'ForCatalog',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    },
    involvedOutputDescendantKeys: {
      Example: { outputEntity: '' },
    },
  };

  const descendant = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    descendant,
  };

  test('should return correct descendant config', () => {
    const result = composeCustomAction(ForCatalog, updateEntityMutationAttributes);

    const expectedResult = {
      name: 'updateEntityForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('updateEntity')
          ? `update${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data', 'token'],
      argTypes: ({ name }: any) => [
        `${name}ForCatalogWhereOneInput!`,
        `${name}ForCatalogUpdateInput!`,
        'String',
      ],
      involvedEntityNames: ({ name }: any) => ({
        inputEntity: `${name}ForCatalog`,
        outputEntity: name,
        subscribeUpdatedEntity: `${name}ForCatalog`,
      }),
      type: ({ name }: any) => `${name}!`,
      config: (entityConfig2: any, generalConfig: any) => entityConfig2, // eslint-disable-line no-unused-vars, no-shadow
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
