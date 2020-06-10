// @flow
/* eslint-env jest */
import type { DerivativeSignatureMethods, GeneralConfig, ThingConfig } from '../flowTypes';

import composeDerivativeConfigByName from './composeDerivativeConfigByName';

describe('composeDerivativeConfigByName', () => {
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
    const ForCatalog: DerivativeSignatureMethods = {
      name: ({ name }) => `${name}ForCatalog`,
      config: (config) => {
        const { name } = config;
        return { ...config, name: `${name}ForCatalog`, floatFields: [{ name: 'floatField' }] };
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
