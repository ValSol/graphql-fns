/* eslint-env jest */
import type { NearInput } from '../../../tsTypes';

import composeNearForAggregateInput from '.';

describe('composeNearForAggregateInput', () => {
  const near: NearInput = {
    geospatialField: 'position',
    coordinates: { lng: 50.435766, lat: 30.515742 },
    maxDistance: 1000,
  };
  test('should create object with simple fields', () => {
    const expectedResult = {
      near: { type: 'Point', coordinates: [50.435766, 30.515742] },
      distanceField: 'position_distance',
      maxDistance: 1000,
      key: 'position.coordinates',
      spherical: true,
    };
    const result = composeNearForAggregateInput(near);

    expect(result).toEqual(expectedResult);
  });
});
