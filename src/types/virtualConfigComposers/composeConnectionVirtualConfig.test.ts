/* eslint-env jest */
import type { TangibleEntityConfig, GeneralConfig, VirtualEntityConfig } from '@/tsTypes';

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
          type: 'intFields',
        },
        {
          name: 'intFields',
          array: true,
          type: 'intFields',
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

    const edgeConfig: VirtualEntityConfig = {
      name: 'ExampleEdge',
      type: 'virtual',
      descendantNameSlicePosition: -'Edge'.length,

      childFields: [{ name: 'node', config: exampleConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { PageInfo: pageInfoConfig, ExampleEdge: edgeConfig },
    };

    const result = composeConnectionVirtualConfig(exampleConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleConnection',
      type: 'virtual',
      descendantNameSlicePosition: -'Connection'.length,

      childFields: [
        { name: 'pageInfo', config: pageInfoConfig, required: true, type: 'childFields' },
        { name: 'edges', config: edgeConfig, array: true, type: 'childFields' },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
