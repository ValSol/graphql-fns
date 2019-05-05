// @flow
/* eslint-env jest */
const composeSortInput = require('./composeSortInput');

describe('composeSortInput', () => {
  test('should create list sorting fields for mongoose', () => {
    const sortBy = ['field1_ASC', 'field2_ASC', 'field3_DESC'];

    const expectedResult = ['field1', 'field2', '-field3'];
    const result = composeSortInput(sortBy);

    expect(result).toEqual(expectedResult);
  });
});
