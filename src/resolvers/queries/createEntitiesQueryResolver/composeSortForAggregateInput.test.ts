/* eslint-env jest */
import composeSortForAggregateInput from './composeSortForAggregateInput';

describe('composeSortForAggregateInput', () => {
  test('should create list sorting fields for mongoose', () => {
    const sortBy = ['field1_ASC', 'field2_ASC', 'field3_DESC'];

    const expectedResult = { $sort: { field1: 1, field2: 1, field3: -1 } };
    const result = composeSortForAggregateInput(sortBy);

    expect(result).toEqual(expectedResult);
  });

  test('should return $natural sorting field', () => {
    const sortBy = ['$natural_ASC'];

    const expectedResult = { $sort: { $natural: 1 } };
    const result = composeSortForAggregateInput(sortBy);

    expect(result).toEqual(expectedResult);
  });
});
