// @flow
/* eslint-env jest */
import type { DerivativeSignatureMethods, GeneralConfig, ThingConfig } from '../flowTypes';

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
    const thingForCatalog: DerivativeSignatureMethods = {
      name: ({ name }) => `${name}ForCatalog`,
      config: (config) => {
        const { name } = config;
        return { ...config, name: `${name}ForCatalog`, floatFields: [{ name: 'floatField' }] };
      },
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
    const thingForCatalog: DerivativeSignatureMethods = {
      name: ({ name }) => (name === 'Example' ? `${name}ForCatalog` : ''),
      config: (config) => {
        const { name } = config;
        return { ...config, name: `${name}ForCatalog`, floatFields: [{ name: 'floatField' }] };
      },
    };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };

    const result = composeDerivativeConfig(thingForCatalog, thingConfig, generalConfig);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });
});
