// @flow
/* eslint-env jest */
import type { NearInput, NearMongodb } from '../../flowTypes';

import composeNearInput from './composeNearInput';

describe('composeNearInput', () => {
  test('should create object with simple fields', () => {
    const near: NearInput = {
      geospatialField: 'position',
      coordinates: { longitude: 50.435766, latitude: 30.515742 },
      maxDistance: 1000,
    };

    const expectedResult: NearMongodb = {
      'position.coordinates': {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [50.435766, 30.515742] },
          $maxDistance: 1000,
        },
      },
    };
    const result = composeNearInput(near);

    expect(result).toEqual(expectedResult);
  });
});
