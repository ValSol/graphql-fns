import toCursor from '.';

describe('toCursor', () => {
  test('filter empty', () => {
    const _id = '61af380a5c2825441ca07902';
    const shift = 10;

    const result = toCursor(_id, shift);

    const expectedResult = 'NjFhZjM4MGE1YzI4MjU0NDFjYTA3OTAyOjEw';

    expect(result).toBe(expectedResult);
  });
});
