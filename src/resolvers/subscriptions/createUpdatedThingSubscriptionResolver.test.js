// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import createUpdatedThingSubscriptionResolver from './createUpdatedThingSubscriptionResolver';

describe('createUpdatedThingSubscriptionResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: {} };
  test('should create mutation add thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };

    const result = createUpdatedThingSubscriptionResolver(thingConfig, generalConfig);
    expect(result).not.toBeNull();
    if (result) expect(typeof result.subscribe).toBe('function'); // "if (result)" to prevent flowjs error
  });
});
