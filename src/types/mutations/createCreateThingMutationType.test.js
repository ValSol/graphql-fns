// @flow
/* eslint-env jest */
const createCreateThingMutationType = require('./createCreateThingMutationType');

describe('createCreateThingMutationType', () => {
  test('should create mutation add thing type', () => {
    const thingConfig = {
      thingName: 'Example',
    };
    const expectedResult = '  createExample(data: ExampleCreateInput!): Example!';

    const result = createCreateThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
