// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

import createUpdateThingMutationResolver from './index';

describe('createUpdateThingMutationResolver', () => {
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

    const serversideConfig = {};
    const result = createUpdateThingMutationResolver(thingConfig, generalConfig, serversideConfig);

    expect(typeof result).toBe('function');
  });
});
