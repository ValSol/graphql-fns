// @flow
/* eslint-env jest */
const createThingQueryType = require('./createThingQueryType');

describe('createThingQueryType', () => {
  test('should create mutation add thing type', () => {
    const thingConfig = {
      thingName: 'Example',
    };
    const expectedResult = '  Example(where: ExampleWhereInput!): Example';

    const result = createThingQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
