// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import pushIntoEntityMutationAttributes from '../../types/actionAttributes/pushIntoEntityMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
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
    const result = composeCustomAction(ForCatalog, pushIntoEntityMutationAttributes);

    const expectedResult = {
      name: 'pushIntoEntityForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('pushIntoEntity')
          ? `pushInto${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data', 'positions'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereOneInput!`,
        `PushInto${name}ForCatalogInput!`,
        `${name}ForCatalogPushPositionsInput`,
      ],
      type: ({ name }) => `${name}ForCatalog!`,
      config: (entityConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, entityConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
