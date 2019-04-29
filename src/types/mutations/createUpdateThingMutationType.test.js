// @flow
/* eslint-env jest */
const createUpdateThingMutationType = require('./createUpdateThingMutationType');

describe('createUpdateThingMutationType', () => {
  test('should create mutation update thing type', () => {
    const thingConfig = {
      name: 'Example',
    };
    const expectedResult =
      '  updateExample(where: ExampleWhereOneInput! data: ExampleUpdateInput!): Example!';

    const result = createUpdateThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
