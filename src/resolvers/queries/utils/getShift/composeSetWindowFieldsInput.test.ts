import composeSetWindowFieldsInput from './composeSetWindowFieldsInput';

describe('composeSetWindowFieldsInput', () => {
  const sort = { sortBy: ['field1_ASC', 'field2_DESC', 'id_ASC'] };

  test('should create object for sort input', () => {
    const arg = { sort };

    const expectedResult = {
      sortBy: { field1: 1, field2: -1, _id: 1 },
      output: {
        calculated_number: { $sum: 1, window: { documents: ['unbounded', 'current'] } },
      },
    };

    const result = composeSetWindowFieldsInput(arg);

    expect(result).toEqual(expectedResult);
  });

  test('should create object for empty input', () => {
    const arg: Record<string, any> = {};

    const expectedResult = {
      sortBy: { not_existed_field: 1 },
      output: {
        calculated_number: { $sum: 1, window: { documents: ['unbounded', 'current'] } },
      },
    };

    const result = composeSetWindowFieldsInput(arg);

    expect(result).toEqual(expectedResult);
  });
});
