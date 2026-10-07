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

  test('args with sort', () => {
    const args = { sort: { sortBy: ['textField1_ASC', 'uniqueField_DESC', 'id_ASC'] } };

    const result = composeLimitingArgs(args, thing);

    expect(result).toBe(args);
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
