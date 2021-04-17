// @flow
/* eslint-env jest */
import composeSortForAggregateInput from './composeSortForAggregateInput';

describe('composeSortForAggregateInput', () => {
  test('should create list sorting fields for mongoose', () => {
    const sortBy = ['field1_ASC', 'field2_ASC', 'field3_DESC'];

    const expectedResult = [
      { $sort: { field1: 1 } },
      { $sort: { field2: 1 } },
      { $sort: { field3: -1 } },
    ];
    const result = composeSortForAggregateInput(sortBy);

    expect(result).toEqual(expectedResult);
  });
});
