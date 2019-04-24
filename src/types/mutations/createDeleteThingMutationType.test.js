// @flow
/* eslint-env jest */
const createDeleteThingMutationType = require('./createDeleteThingMutationType');

describe('createDeleteThingMutationType', () => {
  test('should create mutation delete thing type', () => {
    const thingConfig = {
      name: 'Example',
    };
    const expectedResult = '  deleteExample(where: ExampleWhereInput!): Example';

    const result = createDeleteThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
