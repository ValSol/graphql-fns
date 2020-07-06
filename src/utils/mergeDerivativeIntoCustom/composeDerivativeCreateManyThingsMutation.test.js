// @flow
/* eslint-env jest */

import pluralize from 'pluralize';

import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeCreateManyThingsMutation from './composeDerivativeCreateManyThingsMutation';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';

describe('composeDerivativeCreateManyThingsMutation', () => {
  test('should return correct derivative config', () => {
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
      allow: { Example: ['createManyThings'] },
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

    const result = composeDerivativeCreateManyThingsMutation(ForCatalog);

    const expectedResult = {
      name: 'createManyThingsForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('createManyThings')
          ? `createMany${pluralize(name)}ForCatalog`
          : '',
      argNames: () => ['data'],
      argTypes: ({ name }) => [`[${name}CreateInput!]!`],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
