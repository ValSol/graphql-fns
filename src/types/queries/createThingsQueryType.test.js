// @flow
/* eslint-env jest */

const createThingsQueryType = require('./createThingsQueryType');

describe('createThingsQueryType', () => {
  test('should create query things type without index fields', () => {
    const thingConfig = {
      name: 'Example',
    };
    const expectedResult = '  Examples: [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create query things type with where arg', () => {
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
    const expectedResult = '  Examples(where: ExampleWhereInput): [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with pagination arg', () => {
    const thingConfig = {
      name: 'Example',
      pagination: {
        skip: 100,
        first: 200,
      },
    };
    const expectedResult = '  Examples(pagination: ExamplePaginationInput!): [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
