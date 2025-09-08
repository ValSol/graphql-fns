/* eslint-env jest */
import type {
  EntityConfig,
  GeneralConfig,
  TangibleEntityConfig,
  VirtualEntityConfig,
} from '@/tsTypes';

import composeCreatedOrDeletedPayloadVirtualConfig from './composeCreatedOrDeletedPayloadVirtualConfig';

describe('composeCreatedOrDeletedPayloadVirtualConfig', () => {
  test('compose simple entityConfig', () => {
    const embeddedExampleConfig: EntityConfig = {
      name: 'EmbeddedExample',
      type: 'embedded',

      textFields: [{ name: 'embeddedText', type: 'textFields' }],
    };

    const subscriptionActorExampleConfig: VirtualEntityConfig = {
      name: 'subscriptionActorExample',
      type: 'virtual',

      embeddedFields: [
        { name: 'embeddedExample', config: embeddedExampleConfig, type: 'embeddedFields' },
      ],
    };

    const exampleConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',

      subscriptionActorConfig: subscriptionActorExampleConfig,

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

      calculatedFields: [
        {
          name: 'embeddedExample',
          type: 'calculatedFields',
          calculatedType: 'embeddedFields',
          config: embeddedExampleConfig,
          func: (() => {}) as any,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: {},
    };

    const result = composeCreatedOrDeletedPayloadVirtualConfig(exampleConfig, generalConfig);

    const expectedResult = {
      name: 'ExampleCreatedOrDeletedPayload',
      type: 'virtual',
      descendantNameSlicePosition: -'CreatedOrDeletedPayload'.length,

      childFields: [
        { name: 'node', config: exampleConfig, required: true, type: 'childFields' },
        {
          name: 'actor',
          config: subscriptionActorExampleConfig,
          required: false,
          type: 'childFields',
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
