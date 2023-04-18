/* eslint-env jest */
import type {
  FileEntityConfig,
  SimplifiedFileEntityConfig,
  SimplifiedTangibleEntityConfig,
  TangibleEntityConfig,
} from '../../tsTypes';

import composeAllEntityConfigs from './index';
import PageInfo from './pageInfoConfig';

describe('composeAllEntityConfigs', () => {
  test('compose simple allEntityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedTangibleEntityConfig = {
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

    // const exampleConfig = { ...simplifiedEntityConfig, type: 'tangible' };

    const exampleConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'intField',
          type: 'intFields',
        },
        {
          name: 'intFields',
          type: 'intFields',
          array: true,
        },
      ],
      floatFields: [
        {
          name: 'floatField',
          type: 'floatFields',
        },
        {
          name: 'floatFields',
          array: true,
          type: 'floatFields',
        },
      ],
    };

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      descendantNameSlicePosition: -'Edge'.length,

      type: 'virtual',

      childFields: [{ name: 'node', config: exampleConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig, array: true, type: 'childFields' },
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

  test('compose duplex fields allEntityConfigs', () => {
    const simplifiedEntityConfig: SimplifiedTangibleEntityConfig = {
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

    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      duplexFields: [
        {
          name: 'duplexField',
          config: entityConfig,
          oppositeName: 'duplexFields',
          type: 'duplexFields',
        },
        {
          name: 'duplexFields',
          array: true,
          config: entityConfig,
          oppositeName: 'duplexField',
          type: 'duplexFields',
        },
      ],
    });

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: entityConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig, array: true, type: 'childFields' },
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
    const simplifiedEntityConfig: SimplifiedTangibleEntityConfig = {
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

    const simplifiedImageConfig: SimplifiedFileEntityConfig = {
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

    const imageConfig: FileEntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          freeze: true,
          type: 'textFields',
        },
        {
          name: 'address',
          freeze: true,
          type: 'textFields',
        },
        {
          name: 'title',
          type: 'textFields',
        },
      ],
    };

    const imageEdgeConfig = {
      name: 'ImageEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: imageConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const imageConnectionConfig = {
      name: 'ImageConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: imageEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const tangibleImageConfig = {
      name: 'TangibleImage',
      type: 'tangibleFile',
      textFields: [
        {
          name: 'fileId',
          freeze: true,
          type: 'textFields',
        },
        {
          name: 'address',
          freeze: true,
          type: 'textFields',
        },
      ],
    };

    const entityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          type: 'fileFields',
        },
      ],
    };

    const exampleEdgeConfig = {
      name: 'ExampleEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: entityConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const exampleConnectionConfig = {
      name: 'ExampleConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: exampleEdgeConfig, array: true, type: 'childFields' },
      ],
    };

    const tangibleImageEdgeConfig = {
      name: 'TangibleImageEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: tangibleImageConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const tangibleImageConnectionConfig = {
      name: 'TangibleImageConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: PageInfo, required: true, type: 'childFields' },
        { name: 'edges', config: tangibleImageEdgeConfig, array: true, type: 'childFields' },
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
