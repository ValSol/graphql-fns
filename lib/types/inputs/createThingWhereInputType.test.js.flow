// @flow
/* eslint-env jest */
const createThingWhereInputType = require('./createThingWhereInputType');

describe('createThingWhereInputType', () => {
  test('should create thing input type', () => {
    const thingConfig = {
      thingName: 'Example',
    };
    const expectedResult = `input ExampleWhereInput {
  id: ID!
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
