/* eslint-env jest */
import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeEdgeVirtualConfig from './composeEdgeVirtualConfig';

describe('composeEdgeVirtualConfig', () => {
  test('compose simple entityConfig', () => {
    const exampleConfig: EntityConfig = {
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

    const generalConfig: GeneralConfig = {
      allEntityConfigs: {},
    };

    const result = composeEdgeVirtualConfig(exampleConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleEdge',
      derivativeNameSlicePosition: -'Edge'.length,
      type: 'virtual',

      childFields: [{ name: 'node', config: exampleConfig, type: 'childFields' }],

      textFields: [{ name: 'cursor', required: true, type: 'textFields' }],
    };

    expect(result).toEqual(expectedResult);
  });
});
