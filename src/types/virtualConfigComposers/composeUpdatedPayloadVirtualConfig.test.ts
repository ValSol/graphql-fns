/* eslint-env jest */
import type { EntityConfig, GeneralConfig } from '@/tsTypes';

import composeUpdatedPayloadVirtualConfig from './composeUpdatedPayloadVirtualConfig';

describe('composeUpdatedPayloadVirtualConfig', () => {
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

    const result = composeUpdatedPayloadVirtualConfig(exampleConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleUpdatedPayload',
      type: 'virtual',
      descendantNameSlicePosition: -'UpdatedPayload'.length,

      childFields: [
        { name: 'node', config: exampleConfig, required: true, type: 'childFields' },
        { name: 'previousNode', config: exampleConfig, required: true, type: 'childFields' },
      ],

      textFields: [{ name: 'updatedFields', array: true, type: 'textFields' }],
    };

    expect(result).toEqual(expectedResult);
  });
});
