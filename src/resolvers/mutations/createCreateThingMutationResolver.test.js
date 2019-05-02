// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createCreateThingMutationResolver = require('./createCreateThingMutationResolver');

describe('createCreateThingMutationResolver', () => {
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

    const result = createCreateThingMutationResolver(thingConfig);

    expect(typeof result).toBe('function');
  });
});
