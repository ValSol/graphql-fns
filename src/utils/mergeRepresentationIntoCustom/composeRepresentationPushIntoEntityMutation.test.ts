/* eslint-env jest */
import type { RepresentationAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import pushIntoEntityMutationAttributes from '../../types/actionAttributes/pushIntoEntityMutationAttributes';
import composeRepresentationConfigByName from '../composeRepresentationConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeRepresentationPushIntoEntityMutation', () => {
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
    allow: { Example: ['pushIntoEntity'] },
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
    const result = composeCustomAction(ForCatalog, pushIntoEntityMutationAttributes);

    const expectedResult = {
      name: 'pushIntoEntityForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('pushIntoEntity')
          ? `pushInto${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data', 'positions', 'token'],
      argTypes: ({ name }: any) => [
        `${name}ForCatalogWhereOneInput!`,
        `PushInto${name}ForCatalogInput!`,
        `${name}ForCatalogPushPositionsInput`,
        'String',
      ],
      involvedEntityNames: ({ name }: any) => ({
        inputOutputEntity: `${name}ForCatalog`,
        subscriptionUpdatedEntity: name,
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
