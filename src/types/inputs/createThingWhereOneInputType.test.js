// @flow
/* eslint-env jest */
const createThingWhereOneInputType = require('./createThingWhereOneInputType');

describe('createThingWhereOneInputType', () => {
  test('should create thing input type', () => {
    const thingConfig = {
      name: 'Example',
    };
    const expectedResult = `input ExampleWhereOneInput {
  id: ID!
}`;

    const result = createThingWhereOneInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create thing input type with several args', () => {
    const thingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'email',
          unique: true,
        },
        {
          name: 'userId',
          unique: true,
        },
        {
          name: 'firstName',
        },
      ],
    };
    const expectedResult = `input ExampleWhereOneInput {
  id: ID
  email: ID
  userId: ID
}`;

    const result = createThingWhereOneInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
