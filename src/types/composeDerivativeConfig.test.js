// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../flowTypes';

import composeDerivativeConfig from './composeDerivativeConfig';

describe('composeDerivativeConfig', () => {
  test('should return correct derivative config', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const thingForCatalog: DerivativeAttributes = {
      allowedRootNames: ['Example'],
      suffix: 'ForCatalog',
      config: (config) => ({
        ...config,
        floatFields: [{ name: 'floatField' }],
      }),
    };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };

    const result = composeDerivativeConfig(thingForCatalog, thingConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleForCatalog',
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

  test('should return correct derivative config', () => {
    const thingConfig: ThingConfig = {
      name: 'Example2',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const thingForCatalog: DerivativeAttributes = {
      allowedRootNames: ['Example'],
      suffix: 'ForCatalog',
      config: (config) => ({
        ...config,
        floatFields: [{ name: 'floatField' }],
      }),
    };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };

    const result = composeDerivativeConfig(thingForCatalog, thingConfig, generalConfig);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });
});
