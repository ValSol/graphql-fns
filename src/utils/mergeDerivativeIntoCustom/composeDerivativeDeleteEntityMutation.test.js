// @flow
/* eslint-env jest */

import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import deleteEntityMutationAttributes from '../../types/actionAttributes/deleteEntityMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeDeleteEntityMutation', () => {
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
    allow: { Example: ['deleteEntity'] },
    derivativeKey: 'ForCatalog',
    addFields: {
      Example: () => ({
        floatFields: [{ name: 'floatField' }],
      }),
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, deleteEntityMutationAttributes);

    const expectedResult = {
      name: 'deleteEntityForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('deleteEntity')
          ? `delete${name}ForCatalog`
          : '',
      argNames: () => ['whereOne'],
      argTypes: ({ name }) => [`${name}ForCatalogWhereOneInput!`],
      type: ({ name }) => `${name}ForCatalog!`,
      config: (entityConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, entityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
