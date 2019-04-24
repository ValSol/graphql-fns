// @flow
/* eslint-env jest */
const createThingQueryType = require('./createThingQueryType');

describe('createThingQueryType', () => {
  test('should create query only thing type', () => {
    const thingConfig = {
      name: 'Example',
    };
    const expectedResult = '  Example(where: ExampleWhereInput!): Example';

    const result = createThingQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
