// @flow
/* eslint-env jest */
import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import pageInfoConfig from '../../utils/composeAllEntityConfigs/pageInfoConfig';
import composeConnectionVirtualConfig from './composeConnectionVirtualConfig';

describe('composeConnectionVirtualConfig', () => {
  test('compose simple entityConfig', () => {
    const exampleConfig: EntityConfig = {
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

    const edgeConfig: EntityConfig = {
      name: 'ExampleEdge',
      type: 'virutal',
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
