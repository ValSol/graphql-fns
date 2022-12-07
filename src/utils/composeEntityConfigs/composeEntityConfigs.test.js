// @flow
/* eslint-env jest */
import type { SimplifiedEntityConfig, EntityConfig } from '../../flowTypes';

import composeEntityConfigs from './index';
import PageInfo from './pageInfoConfig';

describe('composeEntityConfigs', () => {
  test('compose simple entityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedEntityConfig = {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'intField',
        },
        {
          name: 'intFields',
          array: true,
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
        {
          name: 'floatFields',
          array: true,
        },
      ],
    };

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      type: 'virtual',

      childFields: [{ name: 'node', config: simplifiedEntityConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: exampleEdgeConfig, array: true },
      ],
    };

    const simplifiedEntityConfigs = [simplifiedEntityConfig];

    const result = composeEntityConfigs(simplifiedEntityConfigs);
    const expectedResult = {
      PageInfo,
      Example: simplifiedEntityConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
    };
    expect(result).toEqual(expectedResult);
  });

  test('compose relatianal & embedded fields entityConfigs', () => {
    const simplifiedEmbedded3Config: SimplifiedEntityConfig = {
      name: 'Embedded3',
      type: 'embedded',
      enumFields: [
        {
          name: 'enumField',
          enumName: 'EnumName',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          configName: 'Example',
        },
      ],
    };

    const simplifiedEmbedded2Config: SimplifiedEntityConfig = {
      name: 'Embedded2',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField3',
          configName: 'Embedded3',
        },
        {
          name: 'embeddedField3a',
          array: true,
          configName: 'Embedded3',
        },
      ],
    };

    const simplifiedEmbeddedConfig: SimplifiedEntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField2',
          configName: 'Embedded2',
        },
        {
          name: 'embeddedField2a',
          array: true,
          configName: 'Embedded2',
        },
      ],
    };

    const simplifiedEntityConfig: SimplifiedEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded',
          configName: 'Embedded',
        },
        {
          name: 'embeddeda',
          configName: 'Embedded',
          array: true,
        },
      ],
    };

    const simplifiedEntityConfigs = [
      simplifiedEmbeddedConfig,
      simplifiedEmbedded2Config,
      simplifiedEmbedded3Config,
      simplifiedEntityConfig,
    ];

    const entityConfig: EntityConfig = {};
    const embedded3Config: EntityConfig = {
      name: 'Embedded3',
      type: 'embedded',
      enumFields: [
        {
          name: 'enumField',
          enumName: 'EnumName',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          config: entityConfig,
        },
      ],
    };

    const embedded2Config: EntityConfig = {
      name: 'Embedded2',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField3',
          config: embedded3Config,
        },
        {
          name: 'embeddedField3a',
          array: true,
          config: embedded3Config,
        },
      ],
    };

    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField2',
          config: embedded2Config,
        },
        {
          name: 'embeddedField2a',
          array: true,
          config: embedded2Config,
        },
      ],
    };

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded',
          config: embeddedConfig,
        },
        {
          name: 'embeddeda',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      type: 'virtual',

      childFields: [{ name: 'node', config: entityConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: exampleEdgeConfig, array: true },
      ],
    };

    const expectedResult = {
      PageInfo,
      Example: entityConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
      Embedded: embeddedConfig,
      Embedded2: embedded2Config,
      Embedded3: embedded3Config,
    };

    const result = composeEntityConfigs(simplifiedEntityConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose duplex fields entityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedEntityConfig = {
      name: 'Example',
      type: 'tangible',
      duplexFields: [
        {
          name: 'duplexField',
          configName: 'Example',
          oppositeName: 'duplexFields',
        },
        {
          name: 'duplexFields',
          array: true,
          configName: 'Example',
          oppositeName: 'duplexField',
        },
      ],
    };

    const simplifiedEntityConfigs = [simplifiedEntityConfig];

    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      duplexFields: [
        {
          name: 'duplexField',
          config: entityConfig,
          oppositeName: 'duplexFields',
        },
        {
          name: 'duplexFields',
          array: true,
          config: entityConfig,
          oppositeName: 'duplexField',
        },
      ],
    });

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      type: 'virtual',

      childFields: [{ name: 'node', config: entityConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: exampleEdgeConfig, array: true },
      ],
    };

    const expectedResult = {
      PageInfo,
      Example: entityConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
    };

    const result = composeEntityConfigs(simplifiedEntityConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose file fields entityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          configName: 'Image',
        },
        {
          name: 'pictures',
          configName: 'Image',
          array: true,
        },
      ],
    };

    const simplifiedImageConfig: SimplifiedEntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          freeze: true,
        },
        {
          name: 'address',
          freeze: true,
        },
        {
          name: 'title',
        },
      ],
    };

    const simplifiedEntityConfigs = [simplifiedEntityConfig, simplifiedImageConfig];

    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          freeze: true,
        },
        {
          name: 'address',
          freeze: true,
        },
        {
          name: 'title',
        },
      ],
    };

    const tangibleImageConfig = {
      name: 'TangibleImage',
      type: 'tangibleFile',
      textFields: [
        {
          name: 'fileId',
          freeze: true,
        },
        {
          name: 'address',
          freeze: true,
        },
      ],
    };

    const entityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
      ],
    };

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      type: 'virtual',

      childFields: [{ name: 'node', config: entityConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: exampleEdgeConfig, array: true },
      ],
    };

    const expectedResult = {
      PageInfo,
      Example: entityConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
      Image: imageConfig,
      TangibleImage: tangibleImageConfig,
    };

    const result = composeEntityConfigs(simplifiedEntityConfigs);
    expect(result).toEqual(expectedResult);
  });
});
