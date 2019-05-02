// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingsQueryResolver = require('./createThingsQueryResolver');

describe('createThingsQueryResolver', () => {
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

    const result = createThingsQueryResolver(thingConfig);

    expect(typeof result).toBe('function');
  });
});
