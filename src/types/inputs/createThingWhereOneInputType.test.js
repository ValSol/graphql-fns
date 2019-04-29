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
});
