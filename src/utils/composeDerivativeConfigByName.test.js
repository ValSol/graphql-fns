// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../flowTypes';

import composeDerivativeConfigByName from './composeDerivativeConfigByName';

describe('composeDerivativeConfigByName', () => {
  test('should return correct derivative config', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const ForCatalog: DerivativeAttributes = {
      allow: { Example: ['thing', 'things'] },
      suffix: 'ForCatalog',
      addFields: {
        Example: {
          floatFields: [{ name: 'floatField' }],
        },
      },
    };

    const derivative = { ForCatalog };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
      derivative,
    };

    const result = composeDerivativeConfigByName('ForCatalog', thingConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleForCatalog',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
