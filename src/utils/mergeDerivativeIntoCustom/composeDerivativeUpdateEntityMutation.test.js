// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import updateEntityMutationAttributes from '../../types/actionAttributes/updateEntityMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeUpdateEntityMutation', () => {
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
    allow: { Example: ['updateEntity'] },
    derivativeKey: 'ForCatalog',
    Example: {
      floatFields: [{ name: 'floatField' }],
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, updateEntityMutationAttributes);

    const expectedResult = {
      name: 'updateEntityForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('updateEntity')
          ? `update${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereOneInput!`, `${name}ForCatalogUpdateInput!`],
      involvedEntityNames: ({ name }) => ({
        mainEntity: `${name}ForCatalog`,
        subscribeUpdatedEntity: 'Example',
      }),
      type: ({ name }) => `${name}ForCatalog!`,
      config: (entityConfig2, generalConfig2) =>
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
  });
});
