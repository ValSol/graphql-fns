/* eslint-env jest */

import composeLimitingArgs from './composeLimitingArgs';

describe('composeLimitingArgs', () => {
  const thing = {
    _id: '1234567890',
    textField1: 'field1 text',
    textField2: 'field2 text',
    uniqueField: 'unique text',
    position: { type: 'Point', coordinates: [30.6021406, 50.516326] }, // <longitude>, <latitude>
  };

  test('emty args object', () => {
    const args: Record<string, any> = {};

    const result = composeLimitingArgs(args, thing);

    const expectedResult: Record<string, any> = {};

    expect(result).toEqual(expectedResult);
  });

  test('args with sort on unique field', () => {
    const args = { sort: { sortBy: ['textField1_ASC', 'uniqueField_DESC'] } };

    const result = composeLimitingArgs(args, thing);

    const expectedResult = {
      ...args,
      sort: { sortBy: ['textField1_ASC', 'uniqueField_DESC'] },
      where: { textField1_lte: 'field1 text', uniqueField_gte: 'unique text' },
    };

    expect(result).toEqual(expectedResult);
  });

  test('args with sort on unique field that null', () => {
    const sort = { sortBy: ['textField1_ASC', 'uniqueField_DESC'] };

    const args = { sort };

    const thing2 = { ...thing, uniqueField: null };

    const result = composeLimitingArgs(args, thing2);

    const expectedResult = {
      sort,
      where: { textField1_lte: 'field1 text' },
    };

    expect(result).toEqual(expectedResult);
  });

  test('args with sort on unique field that nul & other null field', () => {
    const sort = { sortBy: ['textField1_ASC', 'uniqueField_DESC'] };

    const args = { sort };

    const thing2 = { ...thing, textField1: null, uniqueField: null };

    const result = composeLimitingArgs(args, thing2);

    const expectedResult = args;

    expect(result).toBe(expectedResult);
  });

  test('args with sort', () => {
    const sort = { sortBy: ['textField1_ASC', 'textField2_ASC'] };

    const args = { sort };

    const result = composeLimitingArgs(args, thing);

    const expectedResult = {
      sort,
      where: { textField1_lte: 'field1 text', textField2_lte: 'field2 text' },
    };

    expect(result).toEqual(expectedResult);
  });

  test('args with near', () => {
    const near = {
      geospatialField: 'position',
      coordinates: { lng: 29.2417428, lat: 50.7658966 },
      maxDistance: 200000,
    };
    const args = { near };

    const result = composeLimitingArgs(args, thing);

    const expectedResult = {
      near: {
        geospatialField: 'position',
        coordinates: { lng: 29.2417428, lat: 50.7658966 },
        maxDistance: 100062.66170958665,
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
