// @flow
/* eslint-env jest */
const createThingWhereInputType = require('./createThingWhereInputType');

describe('createThingWhereInputType', () => {
  test('should create thing input type it there are index fields', () => {
    const thingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = '';

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type it there are index fields', () => {
    const thingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };
    const expectedResult = `
input ExampleWhereInput {
  firstName: String
  lastName: String
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
