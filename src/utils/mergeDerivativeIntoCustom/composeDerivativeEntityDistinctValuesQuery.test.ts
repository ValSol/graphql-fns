/* eslint-env jest */

import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import entityDistinctValuesQueryAttributes from '../../types/actionAttributes/entityDistinctValuesQueryAttributes';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
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
    const result = composeCustomAction(ForCatalog, entityDistinctValuesQueryAttributes);

    const expectedResult = {
      name: 'entityDistinctValuesForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityDistinctValues')
          ? `${name}DistinctValuesForCatalog`
          : '',
      argNames: () => ['where', 'options'],
      argTypes: ({ name }: any) => [
        `${name}ForCatalogWhereInput`,
        `${name}ForCatalogDistinctValuesOptionsInput`,
      ],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
      type: () => '[String!]!',
      // eslint-disable-next-line no-unused-vars, no-shadow
      config: (entityConfig: any, generalConfig: any) => null,
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
