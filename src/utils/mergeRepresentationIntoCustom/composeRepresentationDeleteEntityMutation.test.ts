/* eslint-env jest */

import type { RepresentationAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import deleteEntityMutationAttributes from '../../types/actionAttributes/deleteEntityMutationAttributes';
import composeRepresentationConfigByName from '../composeRepresentationConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeRepresentationDeleteEntityMutation', () => {
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
    allow: { Example: ['deleteEntity'] },
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
    const result = composeCustomAction(ForCatalog, deleteEntityMutationAttributes);

    const expectedResult = {
      name: 'deleteEntityForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('deleteEntity')
          ? `delete${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'token'],
      argTypes: ({ name }: any) => [`${name}ForCatalogWhereOneInput!`, 'String'],
      involvedEntityNames: ({ name }: any) => ({
        inputOutputEntity: `${name}ForCatalog`,
        subscriptionDeletedEntity: name,
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
