// @flow
/* eslint-env jest */
import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeEdgeVirtualConfig from './composeEdgeVirtualConfig';

describe('composeEdgeVirtualConfig', () => {
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

    const generalConfig: GeneralConfig = {
      allEntityConfigs: {},
    };

    const result = composeEdgeVirtualConfig(exampleConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleEdge',
      derivativeNameSlicePosition: -'Edge'.length,
      type: 'virtual',

      childFields: [{ name: 'node', config: exampleConfig }],

      textFields: [{ name: 'cursor', required: true }],
    };

    expect(result).toEqual(expectedResult);
  });
});
