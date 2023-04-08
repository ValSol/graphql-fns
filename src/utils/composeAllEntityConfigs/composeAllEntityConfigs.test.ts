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
