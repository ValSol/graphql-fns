// @flow
/* eslint-env jest */
const createUpdateThingMutationResolver = require('./createUpdateThingMutationResolver');

describe('createUpdateThingMutationResolver', () => {
  test('should create mutation add thing type', () => {
    const thingConfig = {
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

    const result = createUpdateThingMutationResolver(thingConfig);

    expect(typeof result).toBe('function');
  });
});
