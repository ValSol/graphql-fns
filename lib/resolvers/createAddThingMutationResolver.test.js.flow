// @flow
/* eslint-env jest */
const createAddThingMutationResolver = require('./createAddThingMutationResolver');

describe('createAddThingMutationResolver', () => {
  test('should create mutation add thing type', () => {
    const thingConfig = {
      thingName: 'Example',
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

    const result = createAddThingMutationResolver(thingConfig);

    expect(typeof result).toBe('function');
  });
});
