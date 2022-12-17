// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import pageInfoConfig from '../composeAllEntityConfigs/pageInfoConfig';
import composeDerivativeConfig from './index';

describe('composeDerivativeConfig', () => {
  describe('composeDerivativeConfig', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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

    const additionalEntityConfig: EntityConfig = {
      name: 'AdditionalExample',
      type: 'tangible',
      textFields: [
        {
          name: 'additionalTextField',
          index: true,
        },
      ],
    };

    test('should return correct derivative config with included field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['entity', 'entities'] },
        derivativeKey: 'ForCatalog',
        includeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            floatFields: [{ name: 'floatField' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',
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

    test('should return correct derivative config with freezed field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['entity', 'entities'] },
        derivativeKey: 'ForCatalog',
        freezedFields: { Example: ['textField'] },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',
        textFields: [
          {
            name: 'textField',
            index: true,
            freeze: true,
          },
          {
            name: 'anotherField',
            index: true,
            freeze: false,
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct derivative config with unfreezed field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['entity', 'entities'] },
        derivativeKey: 'ForCatalog',
        unfreezedFields: { Example: ['textField'] },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',
        textFields: [
          {
            name: 'textField',
            index: true,
            freeze: false,
          },
          {
            name: 'anotherField',
            index: true,
            freeze: true,
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct derivative config with excluded field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['entity', 'entities'] },
        derivativeKey: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            floatFields: [{ name: 'floatField' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, entityConfig, generalConfig);

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

    test('should return correct derivative config with added field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['entity', 'entities'] },
        derivativeKey: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            floatFields: [{ name: 'anotherField' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, entityConfig, generalConfig);

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
            name: 'anotherField',
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct derivative config with added field with the same name', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: { Example: ['entity', 'entities'] },
        derivativeKey: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            enumFields: [{ name: 'textField', index: true, enumName: 'enumeration' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',
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
        allow: { Example: ['entity', 'entities'] },
        derivativeKey: 'ForCatalog',
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
        allEntityConfigs: { Example: entityConfig, AdditionalExample: additionalEntityConfig },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',
        textFields: [
          {
            name: 'textField',
            index: true,
          },
        ],
        relationalFields: [
          {
            name: 'additionalRelationalField',
            config: additionalEntityConfig,
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });
  });

  test('should return correct derivative config', () => {
    const entityConfig2: EntityConfig = {
      name: 'Example2',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const ForCatalog: DerivativeAttributes = {
      allow: { Example: ['entity', 'entities'] },
      derivativeKey: 'ForCatalog',
      addFields: {
        Example: {
          floatFields: [{ name: 'anotherField' }],
        },
      },
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example2: entityConfig2 },
      derivative: { ForCatalog },
    };

    const result = composeDerivativeConfig(ForCatalog, entityConfig2, generalConfig);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });

  describe('composeDerivativeConfig with relational third field', () => {
    const entityConfig = {
      name: 'TextExample',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const entityConfig2: EntityConfig = {
      name: 'RelationalExample',
      type: 'tangible',
      relationalFields: [
        {
          name: 'relationalField',
          array: true,
          config: entityConfig,
        },
      ],
    };

    test('should return correct derivative config with derivate field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: {
          TextExample: ['entity', 'childEntities'],
          RelationalExample: ['entity', 'childEntities'],
        },
        derivativeKey: 'ForCatalog',
        derivativeFields: { RelationalExample: { relationalField: 'ForCatalog' } },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { TextExample: entityConfig, RelationalExample: entityConfig2 },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, entityConfig2, generalConfig);
      const entityConfigForCatalog = {
        name: 'TextExampleForCatalog',
        type: 'tangible',
        textFields: [
          {
            name: 'textField',
          },
        ],
      };
      const expectedResult = {
        name: 'RelationalExampleForCatalog',
        type: 'tangible',
        relationalFields: [
          {
            name: 'relationalField',
            array: true,
            config: entityConfigForCatalog,
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe('composeDerivativeConfig with added relational third field', () => {
    const entityConfig = {
      name: 'TextExample2',
      type: 'tangible',
      textFields: [
        {
          name: 'textField2',
        },
      ],
    };
    const entityConfig2: EntityConfig = {
      name: 'RelationalExample2',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    test('should return correct derivative config with added derivate field', () => {
      const ForCatalog: DerivativeAttributes = {
        allow: {
          TextExample2: ['entity', 'childEntities'],
          RelationalExample2: ['entity', 'childEntities'],
        },
        derivativeKey: 'ForCatalog',
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
        allEntityConfigs: { TextExample2: entityConfig, RelationalExample2: entityConfig2 },
        derivative: { ForCatalog },
      };

      const result = composeDerivativeConfig(ForCatalog, entityConfig2, generalConfig);
      const entityConfigForCatalog = {
        name: 'TextExample2ForCatalog',
        type: 'tangible',
        textFields: [
          {
            name: 'textField2',
          },
        ],
      };
      const expectedResult = {
        name: 'RelationalExample2ForCatalog',
        type: 'tangible',
        textFields: [
          {
            name: 'textField',
          },
        ],
        relationalFields: [
          {
            name: 'relationalField',
            array: true,
            config: entityConfigForCatalog,
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe('compose connection DerivativeConfigs', () => {
    const exampleConfig: EntityConfig = {
      name: 'Example2',
      type: 'tangible',
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

    const exampleEdgeConfig = {
      name: 'Example2Edge',
      type: 'virtual',

      childFields: [{ name: 'node', config: exampleConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig = {
      name: 'Example2Connection',
      type: 'virtual',

      childFields: [
        { name: 'pageInfo', config: pageInfoConfig, required: true },
        { name: 'edges', config: exampleEdgeConfig, array: true },
      ],
    };

    const ForCatalog: DerivativeAttributes = {
      allow: {
        Example2: ['entity', 'entities', 'entitiesThroughConnection'],
        Example2Connection: [],
        Example2Edge: [],
      },
      derivativeKey: 'ForCatalog',
      excludeFields: { Example2: ['anotherField'] },
      derivativeFields: {
        Example2Edge: { node: 'ForCatalog' },
        Example2Connection: { edges: 'ForCatalog' },
      },
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: {
        Example2: exampleConfig,
        Example2Edge: exampleEdgeConfig,
        Example2Connection: exampleConnectionConfig,
      },
      derivative: { ForCatalog },
    };

    const entityForCatalogConfig: EntityConfig = {
      name: 'Example2ForCatalog',
      type: 'tangible',

      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    test('should return correct derivative config Example2EdgeForCatalog & Example2ConnectionForCatalog', () => {
      const result = composeDerivativeConfig(ForCatalog, exampleEdgeConfig, generalConfig);

      const expectedExample2EdgeForCatalog = {
        name: 'Example2EdgeForCatalog',
        type: 'virtual',

        childFields: [{ name: 'node', config: entityForCatalogConfig }],

        textFields: [{ name: 'cursor', required: true }],
      };

      expect(result).toEqual(expectedExample2EdgeForCatalog);

      const result2 = composeDerivativeConfig(ForCatalog, exampleConnectionConfig, generalConfig);

      const expectedExample2ConnectionForCatalog = {
        name: 'Example2ConnectionForCatalog',
        type: 'virtual',

        childFields: [
          { name: 'pageInfo', config: pageInfoConfig, required: true },
          { name: 'edges', config: expectedExample2EdgeForCatalog, array: true },
        ],
      };

      expect(result2).toEqual(expectedExample2ConnectionForCatalog);
    });
  });
});
