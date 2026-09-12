/* eslint-env jest */
import type { RepresentationAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import createEntityMutationAttributes from '../../types/actionAttributes/createEntityMutationAttributes';
import composeRepresentationConfigByName from '../composeRepresentationConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeRepresentationCreateEntityMutation', () => {
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
    allow: { Example: ['createEntity'] },
    representationKey: 'ForCatalog',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    },
  };

  const representation = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    representation,
  };

  test('should return correct representation config', () => {
    const result = composeCustomAction(ForCatalog, createEntityMutationAttributes);

    const expectedResult = {
      name: 'createEntityForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('createEntity')
          ? `create${name}ForCatalog`
          : '',
      argNames: () => ['data', 'token'],
      argTypes: ({ name }: any) => [`${name}ForCatalogCreateInput!`, 'String'],
      involvedEntityNames: ({ name }: any) => ({
        inputOutputEntity: `${name}ForCatalog`,
        subscriptionCreatedEntity: name,
      }),
      type: ({ name }: any) => `${name}ForCatalog!`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeRepresentationConfigByName('ForCatalog', entityConfig2, generalConfig2),
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
