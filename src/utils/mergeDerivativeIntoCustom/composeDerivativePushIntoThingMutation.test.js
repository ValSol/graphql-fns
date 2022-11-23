// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import pushIntoThingMutationAttributes from '../../types/actionAttributes/pushIntoThingMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativePushIntoThingMutation', () => {
  const thingConfig: ThingConfig = {
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
    allow: { Example: ['pushIntoThing'] },
    suffix: 'ForCatalog',
    Example: {
      floatFields: [{ name: 'floatField' }],
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    thingConfigs: { Example: thingConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, pushIntoThingMutationAttributes);

    const expectedResult = {
      name: 'pushIntoThingForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('pushIntoThing')
          ? `pushInto${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data', 'positions'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereOneInput!`,
        `PushInto${name}ForCatalogInput!`,
        `${name}ForCatalogPushPositionsInput`,
      ],
      type: ({ name }) => `${name}ForCatalog!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
