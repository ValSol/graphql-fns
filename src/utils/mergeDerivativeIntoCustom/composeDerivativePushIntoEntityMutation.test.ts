/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import pushIntoEntityMutationAttributes from '../../types/actionAttributes/pushIntoEntityMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativePushIntoEntityMutation', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        array: true,
        index: true,
      },
    ],
  };
  const ForCatalog: DerivativeAttributes = {
    allow: { Example: ['pushIntoEntity'] },
    derivativeKey: 'ForCatalog',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, pushIntoEntityMutationAttributes);

    const expectedResult = {
      name: 'pushIntoEntityForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('pushIntoEntity')
          ? `pushInto${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data', 'positions'],
      argTypes: ({ name }: any) => [
        `${name}ForCatalogWhereOneInput!`,
        `PushInto${name}ForCatalogInput!`,
        `${name}ForCatalogPushPositionsInput`,
      ],
      involvedEntityNames: ({ name }: any) => ({
        inputOutputEntity: `${name}ForCatalog`,
        subscribeUpdatedEntity: 'Example',
      }),
      type: ({ name }: any) => `${name}ForCatalog!`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
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
