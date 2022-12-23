// @flow
/* eslint-env jest */
import type { SimplifiedEntityConfig, EntityConfig } from '../../flowTypes';

import composeAllEntityConfigs from './index';
import PageInfo from './pageInfoConfig';

describe('composeAllEntityConfigs', () => {
  test('compose simple allEntityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedEntityConfig = {
      name: 'Example',
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

    const exampleConfig = { ...simplifiedEntityConfig, type: 'tangible' };

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      derivativeNameSlicePosition: -'Edge'.length,

      type: 'virtual',

      childFields: [{ name: 'node', config: exampleConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: exampleEdgeConfig, array: true },
      ],
    };

    const simplifiedAllEntityConfigs = [simplifiedEntityConfig];

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const expectedResult = {
      PageInfo,
      Example: exampleConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
    };
    expect(result).toEqual(expectedResult);
  });

  test('compose relatianal & embedded fields allEntityConfigs', () => {
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

    const simplifiedAllEntityConfigs = [
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

    const embedded3EdgeConfig = {
      name: 'Embedded3Edge',
      type: 'virtual',
      derivativeNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: embedded3Config }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const embedded3ConnectionConfig = {
      name: 'Embedded3Connection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: embedded3EdgeConfig, array: true },
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

    const embedded2EdgeConfig = {
      name: 'Embedded2Edge',
      type: 'virtual',
      derivativeNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: embedded2Config }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const embedded2ConnectionConfig = {
      name: 'Embedded2Connection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: embedded2EdgeConfig, array: true },
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

    const embeddedEdgeConfig = {
      name: 'EmbeddedEdge',
      type: 'virtual',
      derivativeNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: embeddedConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const embeddedConnectionConfig = {
      name: 'EmbeddedConnection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: embeddedEdgeConfig, array: true },
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
      derivativeNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: entityConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

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
      EmbeddedEdge: embeddedEdgeConfig,
      EmbeddedConnection: embeddedConnectionConfig,
      Embedded2: embedded2Config,
      Embedded2Edge: embedded2EdgeConfig,
      Embedded2Connection: embedded2ConnectionConfig,
      Embedded3: embedded3Config,
      Embedded3Edge: embedded3EdgeConfig,
      Embedded3Connection: embedded3ConnectionConfig,
    };

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose duplex fields allEntityConfigs', () => {
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

    const simplifiedAllEntityConfigs = [simplifiedEntityConfig];

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
      derivativeNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: entityConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

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

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose file fields allEntityConfigs', () => {
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

    const simplifiedAllEntityConfigs = [simplifiedEntityConfig, simplifiedImageConfig];

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

    const imageEdgeConfig = {
      name: 'ImageEdge',
      type: 'virtual',
      derivativeNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: imageConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const imageConnectionConfig = {
      name: 'ImageConnection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: imageEdgeConfig, array: true },
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
      derivativeNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: entityConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: exampleEdgeConfig, array: true },
      ],
    };

    const tangibleImageEdgeConfig = {
      name: 'TangibleImageEdge',
      type: 'virtual',
      derivativeNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: tangibleImageConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const tangibleImageConnectionConfig = {
      name: 'TangibleImageConnection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true },
        { name: 'edges', config: tangibleImageEdgeConfig, array: true },
      ],
    };

    const expectedResult = {
      PageInfo,
      Example: entityConfig,
      ExampleEdge: exampleEdgeConfig,
      ExampleConnection: exampleConnectionConfig,
      Image: imageConfig,
      ImageEdge: imageEdgeConfig,
      ImageConnection: imageConnectionConfig,
      TangibleImage: tangibleImageConfig,
      TangibleImageEdge: tangibleImageEdgeConfig,
      TangibleImageConnection: tangibleImageConnectionConfig,
    };

    const result = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    expect(result).toEqual(expectedResult);
  });
});
