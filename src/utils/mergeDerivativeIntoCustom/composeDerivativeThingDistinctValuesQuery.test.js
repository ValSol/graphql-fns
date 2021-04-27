// @flow
/* eslint-env jest */

import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import thingDistinctValuesQueryAttributes from '../../types/actionAttributes/thingDistinctValuesQueryAttributes';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeThingDistinctValuesQuery', () => {
  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
        array: true,
        index: true,
      },
    ],
  };
  const ForCatalog: DerivativeAttributes = {
    allow: { Example: ['thingDistinctValues'] },
    suffix: 'ForCatalog',
    addFields: {
      Example: () => ({
        floatFields: [{ name: 'floatField' }],
      }),
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    thingConfigs: { Example: thingConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, thingDistinctValuesQueryAttributes);

    const expectedResult = {
      name: 'thingDistinctValuesForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('thingDistinctValues')
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

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
