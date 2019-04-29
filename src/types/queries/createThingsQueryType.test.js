// @flow
/* eslint-env jest */

const createThingsQueryType = require('./createThingsQueryType');

describe('createThingsQueryType', () => {
  test('should create query only thing type', () => {
    const thingConfig = {
      name: 'Example',
    };
    const expectedResult = '  Examples(where: ExampleWhereInput): [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
