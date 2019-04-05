// @flow
/* eslint-env jest */
const createAddThingMutationType = require('./createAddThingMutationType');

describe('createAddThingMutationType', () => {
  test('should create mutation add thing type', () => {
    const thingConfig = {
      thingName: 'Example',
    };
    const expectedResult = '  addExample(input: ExampleInput): Example!';

    const result = createAddThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
