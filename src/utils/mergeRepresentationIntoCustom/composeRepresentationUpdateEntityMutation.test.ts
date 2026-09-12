/* eslint-env jest */
import type { RepresentationAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import updateEntityMutationAttributes from '../../types/actionAttributes/updateEntityMutationAttributes';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeRepresentationUpdateEntityMutation', () => {
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
  const ForCatalog: RepresentationAttributes = {
    allow: { Example: ['updateEntity'] },
    representationKey: 'ForCatalog',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    },
    involvedOutputRepresentationKeys: {
      Example: { outputEntity: '' },
    },
  };

  const representation = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    representation,
  };

  test('should return correct representation config', () => {
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
        subscriptionUpdatedEntity: name,
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
