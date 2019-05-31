// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const createThingCountQueryResolver = require('./createThingCountQueryResolver');

describe('createThingCountQueryResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
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

    const result = createThingCountQueryResolver(thingConfig, generalConfig);

    expect(typeof result).toBe('function');
  });
});
