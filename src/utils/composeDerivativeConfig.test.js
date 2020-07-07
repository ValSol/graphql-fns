// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../flowTypes';

import composeDerivativeConfig from './composeDerivativeConfig';

describe('composeDerivativeConfig', () => {
  describe('composeDerivativeConfig', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
        {
          name: 'anotherField',
          index: true,
        },
      ],
    };

    const additionalThingConfig: ThingConfig = {
      name: 'AdditionalExample',
      textFields: [
        {
          name: 'additionalTextField',
          index: true,
        },
      ],
    };

    test('should return correct derivative config with included field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['thing', 'things'] },
        suffix: 'ForCatalog',
        includeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            floatFields: [{ name: 'floatField' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        thingConfigs: { Example: thingConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, thingConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        textFields: [
          {
            name: 'anotherField',
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

    test('should return correct derivative config with excluded field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['thing', 'things'] },
        suffix: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            floatFields: [{ name: 'floatField' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        thingConfigs: { Example: thingConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, thingConfig, generalConfig);

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

    test('should return correct derivative config with added field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['thing', 'things'] },
        suffix: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            floatFields: [{ name: 'anotherField' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        thingConfigs: { Example: thingConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, thingConfig, generalConfig);

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
            name: 'anotherField',
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct derivative config with added field with the same name', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['thing', 'things'] },
        suffix: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            enumFields: [{ name: 'textField', index: true, enumName: 'enumeration' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        thingConfigs: { Example: thingConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, thingConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        enumFields: [
          {
            name: 'textField',
            index: true,
            enumName: 'enumeration',
          },
        ],
        textFields: [],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct derivative config with added relational field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['thing', 'things'] },
        suffix: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            relationalFields: [
              {
                name: 'additionalRelationalField',
                configName: 'AdditionalExample',
              },
            ],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        thingConfigs: { Example: thingConfig, AdditionalExample: additionalThingConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, thingConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        textFields: [
          {
            name: 'textField',
            index: true,
          },
        ],
        relationalFields: [
          {
            name: 'additionalRelationalField',
            config: additionalThingConfig,
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });
  });

  test('should return correct derivative config', () => {
    const thingConfig2: ThingConfig = {
      name: 'Example2',
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
          floatFields: [{ name: 'anotherField' }],
        },
      },
    };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example2: thingConfig2 },
      derivative: { ForCatalog },
    };

    const result = composeDerivativeConfig(ForCatalog, thingConfig2, generalConfig);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });

  describe('composeDerivativeConfig with relational third field', () => {
    const thingConfig = {
      name: 'TextExample',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfig2: ThingConfig = {
      name: 'RelationalExample',
      relationalFields: [
        {
          name: 'relationalField',
          array: true,
          config: thingConfig,
        },
      ],
    };

    test('should return correct derivative config with derivate field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { TextExample: ['thing', 'things'], RelationalExample: ['thing', 'things'] },
        suffix: 'ForCatalog',
        derivativeFields: { RelationalExample: { relationalField: 'ForCatalog' } },
      };

      const generalConfig: GeneralConfig = {
        thingConfigs: { TextExample: thingConfig, RelationalExample: thingConfig2 },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, thingConfig2, generalConfig);
      const thingConfigForCatalog = {
        name: 'TextExampleForCatalog',
        textFields: [
          {
            name: 'textField',
          },
        ],
      };
      const expectedResult = {
        name: 'RelationalExampleForCatalog',
        relationalFields: [
          {
            name: 'relationalField',
            array: true,
            config: thingConfigForCatalog,
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe('composeDerivativeConfig with added relational third field', () => {
    const thingConfig = {
      name: 'TextExample2',
      textFields: [
        {
          name: 'textField2',
        },
      ],
    };
    const thingConfig2: ThingConfig = {
      name: 'RelationalExample2',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    test('should return correct derivative config with added derivate field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { TextExample2: ['thing', 'things'], RelationalExample2: ['thing', 'things'] },
        suffix: 'ForCatalog',
        addFields: {
          RelationalExample2: {
            relationalFields: [
              {
                name: 'relationalField',
                array: true,
                configName: 'TextExample2',
              },
            ],
          },
        },
        derivativeFields: { RelationalExample2: { relationalField: 'ForCatalog' } },
      };

      const generalConfig: GeneralConfig = {
        thingConfigs: { TextExample2: thingConfig, RelationalExample2: thingConfig2 },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, thingConfig2, generalConfig);
      const thingConfigForCatalog = {
        name: 'TextExample2ForCatalog',
        textFields: [
          {
            name: 'textField2',
          },
        ],
      };
      const expectedResult = {
        name: 'RelationalExample2ForCatalog',
        textFields: [
          {
            name: 'textField',
          },
        ],
        relationalFields: [
          {
            name: 'relationalField',
            array: true,
            config: thingConfigForCatalog,
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });
  });
});
