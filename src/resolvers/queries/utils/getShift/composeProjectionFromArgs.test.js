// @flow
/* eslint-env jest */

import composeProjectionFromArgs from './composeProjectionFromArgs';

describe('composeProjectionFromArgs', () => {
  const search = 'some token';

  const sort = { sortBy: ['field1_ASC', 'field2_ASC', 'field3_DESC'] };

  const near = {
    geospatialField: 'position',
    coordinates: { lng: 50.435766, lat: 30.515742 },
    maxDistance: 1000,
  };

  test('return for emty args object', () => {
    const args = {};

    const expectedResult = { _id: 1 };
    const result = composeProjectionFromArgs(args);

    expect(result).toEqual(expectedResult);
  });

  test('return for args with search', () => {
    const args = { search };

    const expectedResult = { _id: 1 };
    const result = composeProjectionFromArgs(args);

    expect(result).toEqual(expectedResult);
  });

  test('return for args with sort', () => {
    const args = { sort };

    const expectedResult = { field1: 1, field2: 1, field3: 1 };
    const result = composeProjectionFromArgs(args);

    expect(result).toEqual(expectedResult);
  });

  test('return for args with sort', () => {
    const args = { near };

    const expectedResult = { position: 1 };
    const result = composeProjectionFromArgs(args);

    expect(result).toEqual(expectedResult);
  });
});
