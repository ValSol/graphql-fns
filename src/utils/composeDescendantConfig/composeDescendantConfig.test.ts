/* eslint-env jest */
import type {
  DescendantAttributes,
  GeneralConfig,
  TangibleEntityConfig,
  VirtualEntityConfig,
} from '../../tsTypes';

import pageInfoConfig from '../composeAllEntityConfigs/pageInfoConfig';
import composeDescendantConfig from './index';

describe('composeDescendantConfig', () => {
  describe('composeDescendantConfig', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',

      uniqueCompoundIndexes: [['textField', 'anotherField']],

      interfaces: ['ExamleInterface'],

      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
        {
          name: 'anotherField',
          index: true,
          type: 'textFields',
        },
      ],
    };

    const additionalEntityConfig: TangibleEntityConfig = {
      name: 'AdditionalExample',
      type: 'tangible',
      textFields: [
        {
          name: 'additionalTextField',
          index: true,
          type: 'textFields',
        },
      ],
    };

    test('should return correct descendant config with included field', () => {
      const ForCatalog: DescendantAttributes = {
        allow: { Example: ['entity', 'entities'] },
        interfaces: { Example: ['ExampleForCatalogInterview'] },
        descendantKey: 'ForCatalog',
        includeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            floatFields: [{ name: 'floatField' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        descendant: { ForCatalog },
      };

      const result = composeDescendantConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',

        uniqueCompoundIndexes: [['textField', 'anotherField']],

        interfaces: ['ExampleForCatalogInterview'],

        textFields: [
          {
            name: 'anotherField',
            index: true,
            type: 'textFields',
          },
        ],
        floatFields: [
          {
            name: 'floatField',
            type: 'floatFields',
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct descendant config with freezed field', () => {
      const ForCatalog: DescendantAttributes = {
        allow: { Example: ['entity', 'entities'] },
        descendantKey: 'ForCatalog',
        freezedFields: { Example: ['textField'] },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        descendant: { ForCatalog },
      };

      const result = composeDescendantConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',

        uniqueCompoundIndexes: [['textField', 'anotherField']],

        textFields: [
          {
            name: 'textField',
            index: true,
            freeze: true,
            type: 'textFields',
          },
          {
            name: 'anotherField',
            index: true,
            freeze: false,
            type: 'textFields',
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct descendant config with unfreezed field', () => {
      const ForCatalog: DescendantAttributes = {
        allow: { Example: ['entity', 'entities'] },
        descendantKey: 'ForCatalog',
        unfreezedFields: { Example: ['textField'] },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        descendant: { ForCatalog },
      };

      const result = composeDescendantConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',

        uniqueCompoundIndexes: [['textField', 'anotherField']],

        textFields: [
          {
            name: 'textField',
            index: true,
            freeze: false,
            type: 'textFields',
          },
          {
            name: 'anotherField',
            index: true,
            freeze: true,
            type: 'textFields',
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct descendant config with excluded field', () => {
      const ForCatalog: DescendantAttributes = {
        allow: { Example: ['entity', 'entities'] },
        descendantKey: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            floatFields: [{ name: 'floatField' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        descendant: { ForCatalog },
      };

      const result = composeDescendantConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',

        uniqueCompoundIndexes: [['textField', 'anotherField']],

        textFields: [
          {
            name: 'textField',
            index: true,
            type: 'textFields',
          },
        ],
        floatFields: [
          {
            name: 'floatField',
            type: 'floatFields',
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct descendant config with added field', () => {
      const ForCatalog: DescendantAttributes = {
        allow: { Example: ['entity', 'entities'] },
        descendantKey: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            floatFields: [{ name: 'anotherField' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        descendant: { ForCatalog },
      };

      const result = composeDescendantConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',

        uniqueCompoundIndexes: [['textField', 'anotherField']],

        textFields: [
          {
            name: 'textField',
            index: true,
            type: 'textFields',
          },
        ],
        floatFields: [
          {
            name: 'anotherField',
            type: 'floatFields',
          },
        ],
      };

      expect(result).toEqual(expectedResult);
    });

    test('should return correct descendant config with added field with the same name', () => {
      const ForCatalog: DescendantAttributes = {
        allow: { Example: ['entity', 'entities'] },
        descendantKey: 'ForCatalog',
        excludeFields: { Example: ['anotherField'] },
        addFields: {
          Example: {
            enumFields: [{ name: 'textField', index: true, enumName: 'enumeration' }],
          },
        },
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { Example: entityConfig },
        descendant: { ForCatalog },
      };

      const result = composeDescendantConfig(ForCatalog, entityConfig, generalConfig);

      const expectedResult = {
        name: 'ExampleForCatalog',
        type: 'tangible',

        uniqueCompoundIndexes: [['textField', 'anotherField']],

        enumFields: [
          {
            name: 'textField',
            index: true,
            enumName: 'enumeration',
            type: 'enumFields',
          },
        ],
        textFields: [],
      };

      expect(result).toEqual(expectedResult);
    });
  });

  test('should return correct descendant config', () => {
    const entityConfig2: TangibleEntityConfig = {
      name: 'Example2',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
    };
    const ForCatalog: DescendantAttributes = {
      allow: { Example: ['entity', 'entities'] },
      descendantKey: 'ForCatalog',
      addFields: {
        Example: {
          floatFields: [{ name: 'anotherField' }],
        },
      },
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example2: entityConfig2 },
      descendant: { ForCatalog },
    };

    const result = composeDescendantConfig(ForCatalog, entityConfig2, generalConfig);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });

  describe('composeDescendantConfig with relational third field', () => {
    const entityConfig2 = {} as TangibleEntityConfig;
    const entityConfig: TangibleEntityConfig = {
      name: 'TextExample',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'parentRelationalField',
          oppositeName: 'relationalField',
          array: true,
          config: entityConfig2,
          parent: true,
          type: 'relationalFields',
        },
      ],
    };
    Object.assign(entityConfig2, {
      name: 'RelationalExample',
      type: 'tangible',
      relationalFields: [
        {
          name: 'relationalField',
          oppositeName: 'parentRelationalField',
          array: true,
          config: entityConfig,
          type: 'relationalFields',
        },
      ],
    });

    test('should return correct descendant config with derivate field', () => {
      const ForCatalog: DescendantAttributes = {
        allow: {
          TextExample: ['entity', 'childEntities'],
          RelationalExample: ['entity', 'childEntities'],
        },
        descendantKey: 'ForCatalog',
      };

      const generalConfig: GeneralConfig = {
        allEntityConfigs: { TextExample: entityConfig, RelationalExample: entityConfig2 },
        descendant: { ForCatalog },
      };

      const result = composeDescendantConfig(ForCatalog, entityConfig2, generalConfig);
      const expectedResult = {} as TangibleEntityConfig;

      const entityConfigForCatalog = {
        name: 'TextExampleForCatalog',
        type: 'tangible',
        textFields: [
          {
            name: 'textField',
            type: 'textFields',
          },
        ],
        relationalFields: [
          {
            name: 'parentRelationalField',
            oppositeName: 'relationalField',
            config: expectedResult,
            array: true,
            parent: true,
            type: 'relationalFields',
          },
        ],
      };

      Object.assign(expectedResult, {
        name: 'RelationalExampleForCatalog',
        type: 'tangible',
        relationalFields: [
          {
            name: 'relationalField',
            oppositeName: 'parentRelationalField',
            array: true,
            config: entityConfigForCatalog,
            type: 'relationalFields',
          },
        ],
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe('compose connection DescendantConfigs', () => {
    const exampleConfig: TangibleEntityConfig = {
      name: 'Example2',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
        {
          name: 'anotherField',
          index: true,
          type: 'textFields',
        },
      ],
    };

    const exampleEdgeConfig: VirtualEntityConfig = {
      name: 'Example2Edge',
      type: 'virtual',

      childFields: [{ name: 'node', config: exampleConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig: VirtualEntityConfig = {
      name: 'Example2Connection',
      type: 'virtual',

      childFields: [
        { name: 'pageInfo', config: pageInfoConfig, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const ForCatalog: DescendantAttributes = {
      allow: {
        Example2: ['entity', 'entities', 'entitiesThroughConnection'],
        Example2Connection: [],
        Example2Edge: [],
      },
      descendantKey: 'ForCatalog',
      excludeFields: { Example2: ['anotherField'] },
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: {
        Example2: exampleConfig,
        Example2Edge: exampleEdgeConfig,
        Example2Connection: exampleConnectionConfig,
      },
      descendant: { ForCatalog },
    };

    const entityForCatalogConfig: TangibleEntityConfig = {
      name: 'Example2ForCatalog',
      type: 'tangible',

      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
    };

    test('should return correct descendant config Example2EdgeForCatalog & Example2ConnectionForCatalog', () => {
      const result = composeDescendantConfig(ForCatalog, exampleEdgeConfig, generalConfig);

      const expectedExample2EdgeForCatalog: VirtualEntityConfig = {
        name: 'Example2EdgeForCatalog',
        type: 'virtual',

        childFields: [{ name: 'node', config: entityForCatalogConfig, type: 'childFields' }],

        textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
      };

      expect(result).toEqual(expectedExample2EdgeForCatalog);

      const result2 = composeDescendantConfig(ForCatalog, exampleConnectionConfig, generalConfig);

      const expectedExample2ConnectionForCatalog: VirtualEntityConfig = {
        name: 'Example2ConnectionForCatalog',
        type: 'virtual',

        childFields: [
          { name: 'pageInfo', config: pageInfoConfig, required: true, type: 'childFields' },
          {
            name: 'edges',
            config: expectedExample2EdgeForCatalog,
            array: true,
            type: 'childFields',
          },
        ],
      };

      expect(result2).toEqual(expectedExample2ConnectionForCatalog);
    });
  });
});
