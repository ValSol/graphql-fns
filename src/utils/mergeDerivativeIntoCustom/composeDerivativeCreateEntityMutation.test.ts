/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import createEntityMutationAttributes from '../../types/actionAttributes/createEntityMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeCreateEntityMutation', () => {
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
    allow: { Example: ['createEntity'] },
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
    const result = composeCustomAction(ForCatalog, createEntityMutationAttributes);

    const expectedResult = {
      name: 'createEntityForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('createEntity')
          ? `create${name}ForCatalog`
          : '',
      argNames: () => ['data'],
      argTypes: ({ name }: any) => [`${name}ForCatalogCreateInput!`],
      involvedEntityNames: ({ name }: any) => ({
        inputOutputEntity: `${name}ForCatalog`,
        subscribeCreatedEntity: 'Example',
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
