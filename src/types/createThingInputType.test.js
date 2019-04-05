// @flow
/* eslint-env jest */
const createThingInputType = require('./createThingInputType');

describe('createThingInputType', () => {
  test('should create thing input type', () => {
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
    const expectedResult = `type ExampleInput {
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]!
  textField5: [String!]!
}`;

    const result = createThingInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
