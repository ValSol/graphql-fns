// @flow
/* eslint-env jest */
import type { NearInput } from '../../../../flowTypes';

import composeSetWindowFieldsInput from './composeSetWindowFieldsInput';

describe('composeSetWindowFieldsInput', () => {
  const near: NearInput = {
    geospatialField: 'position',
    coordinates: { lng: 50.435766, lat: 30.515742 },
    maxDistance: 1000,
  };

  const sort = { sortBy: ['field1_ASC', 'field2_DESC'] };

  test('should create object for near input', () => {
    const arg = { near };

    const expectedResult = {
      sortBy: { position_distance: 1 },
      output: {
        calculated_number: {
          $documentNumber: {},
        },
      },
    };

    const result = composeSetWindowFieldsInput(arg);

    expect(result).toEqual(expectedResult);
  });

  test('should create object for sort input', () => {
    const arg = { sort };

    const expectedResult = {
      sortBy: { field1: 1, field2: -1 },
      output: {
        calculated_number: {
          $documentNumber: {},
        },
      },
    };

    const result = composeSetWindowFieldsInput(arg);

    expect(result).toEqual(expectedResult);
  });

  test('should create object for sort input', () => {
    const arg = {};

    const expectedResult = {
      sortBy: { not_existed_field: 1 },
      output: {
        calculated_number: {
          $documentNumber: {},
        },
      },
    };

    const result = composeSetWindowFieldsInput(arg);

    expect(result).toEqual(expectedResult);
  });
});
