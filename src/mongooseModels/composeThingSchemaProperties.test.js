// @flow
/* eslint-env jest */
const composeThingSchemaProperties = require('./composeThingSchemaProperties');

describe('composeThingSchemaProperties', () => {
  test('should compose schema properties with text fields', () => {
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
    const expectedResult = {
      textField1: {
        type: String,
        required: false,
        default: '',
      },
      textField2: {
        type: String,
        required: false,
        default: 'default text',
      },
      textField3: {
        type: String,
        required: true,
        default: '',
      },
      textField4: {
        type: [String],
        required: false,
        default: [],
      },
      textField5: {
        type: [String],
        required: true,
        default: ['default text'],
      },
    };

    const result = composeThingSchemaProperties(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
