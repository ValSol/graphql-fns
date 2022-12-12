// @flow
/* eslint-env jest */

import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import entityDistinctValuesQueryAttributes from '../../types/actionAttributes/entityDistinctValuesQueryAttributes';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeEntityDistinctValuesQuery', () => {
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
    allow: { Example: ['entityDistinctValues'] },
    suffix: 'ForCatalog',
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
    const result = composeCustomAction(ForCatalog, entityDistinctValuesQueryAttributes);

    const expectedResult = {
      name: 'entityDistinctValuesForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityDistinctValues')
          ? `${name}DistinctValuesForCatalog`
          : '',
      argNames: () => ['where', 'options'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereInput`,
        `${name}ForCatalogDistinctValuesOptionsInput`,
      ],
      type: () => '[String!]!',
      config: () => null,
    };

    const result2 = composeActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, entityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
