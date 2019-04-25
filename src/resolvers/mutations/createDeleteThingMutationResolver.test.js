// @flow
/* eslint-env jest */
const createDeleteThingMutationResolver = require('./createDeleteThingMutationResolver');

describe('createDeleteThingMutationResolver', () => {
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

    const result = createDeleteThingMutationResolver(thingConfig);

    expect(typeof result).toBe('function');
  });
});
