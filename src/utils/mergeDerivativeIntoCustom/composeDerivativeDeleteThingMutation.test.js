// @flow
/* eslint-env jest */

import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeDeleteThingMutation from './composeDerivativeDeleteThingMutation';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';

describe('composeDerivativeDeleteThingMutation', () => {
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
      allow: { Example: ['deleteThing'] },
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

    const result = composeDerivativeDeleteThingMutation(ForCatalog);

    const expectedResult = {
      name: 'deleteThingForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('deleteThing')
          ? `delete${name}ForCatalog`
          : '',
      argNames: () => ['whereOne'],
      argTypes: ({ name }) => [`${name}WhereOneInput!`],
      type: ({ name }) => `${name}ForCatalog`,
      config: (thingConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', thingConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, thingConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, thingConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
