/* eslint-env jest */
import type { TangibleEntityConfig, GeneralConfig, VirtualEntityConfig } from '../../tsTypes';

import pageInfoConfig from '../../utils/composeAllEntityConfigs/pageInfoConfig';
import composeConnectionVirtualConfig from './composeConnectionVirtualConfig';

describe('composeConnectionVirtualConfig', () => {
  test('compose simple entityConfig', () => {
    const exampleConfig: TangibleEntityConfig = {
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

    const edgeConfig: VirtualEntityConfig = {
      name: 'ExampleEdge',
      type: 'virtual',
      derivativeNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: exampleConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { PageInfo: pageInfoConfig, ExampleEdge: edgeConfig },
    };

    const result = composeConnectionVirtualConfig(exampleConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleConnection',
      type: 'virtual',
      derivativeNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: pageInfoConfig, required: true },
        { name: 'edges', config: edgeConfig, array: true },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
