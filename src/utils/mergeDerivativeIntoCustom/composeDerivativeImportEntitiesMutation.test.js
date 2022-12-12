// @flow
/* eslint-env jest */

import pluralize from 'pluralize';

import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import importEntitiesMutationAttributes from '../../types/actionAttributes/importEntitiesMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeImportEntitiesMutation', () => {
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
    allow: { Example: ['importEntities'] },
    suffix: 'ForCatalog',
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
    const result = composeCustomAction(ForCatalog, importEntitiesMutationAttributes);

    const expectedResult = {
      name: 'importentitiesForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('importEntities')
          ? `import${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['file', 'options'],
      argTypes: () => ['Upload!', 'ImportOptionsInput'],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (entityConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, entityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
