/* eslint-env jest */
import type { EntityConfig, NearInput } from '@/tsTypes';

import composeNearForAggregateInput from '.';

describe('composeNearForAggregateInput', () => {
  const entityConfig: EntityConfig = {
    name: 'testEntity',
    geospatialFields: [
      { name: 'position', type: 'geospatialFields', geospatialType: 'Point', index: true },
      { name: 'area', type: 'geospatialFields', geospatialType: 'Polygon', index: true },
      { name: 'multiArea', type: 'geospatialFields', geospatialType: 'MultiPolygon', index: true },
    ],
  };

  test('Point', () => {
    const near: NearInput = {
      geospatialField: 'position',
      coordinates: { lng: 50.435766, lat: 30.515742 },
      maxDistance: 1000,
    };

    const result = composeNearForAggregateInput(near, entityConfig);

    const expectedResult = {
      near: { type: 'Point', coordinates: [50.435766, 30.515742] },
      distanceField: 'position_distance',
      maxDistance: 1000,
      key: 'position.coordinates',
      spherical: true,
    };

    expect(result).toEqual(expectedResult);
  });

  test('Point', () => {
    const near: NearInput = {
      geospatialField: 'position',
      coordinates: { lng: 50.435766, lat: 30.515742 },
      maxDistance: 1000,
    };

    const result = composeNearForAggregateInput(near, entityConfig);

    const expectedResult = {
      near: { type: 'Point', coordinates: [50.435766, 30.515742] },
      distanceField: 'position_distance',
      maxDistance: 1000,
      key: 'position.coordinates',
      spherical: true,
    };

    expect(result).toEqual(expectedResult);
  });

  test('Polygon', () => {
    const near: NearInput = {
      geospatialField: 'area',
      coordinates: { lng: 50.435766, lat: 30.515742 },
      maxDistance: 1000,
    };

    const result = composeNearForAggregateInput(near, entityConfig);

    const expectedResult = {
      near: { type: 'Point', coordinates: [50.435766, 30.515742] },
      distanceField: 'area_distance',
      maxDistance: 1000,
      key: 'area',
      spherical: true,
    };

    expect(result).toEqual(expectedResult);
  });

  test('MultiPolygon', () => {
    const near: NearInput = {
      geospatialField: 'multiArea',
      coordinates: { lng: 50.435766, lat: 30.515742 },
      maxDistance: 1000,
    };

    const result = composeNearForAggregateInput(near, entityConfig);

    const expectedResult = {
      near: { type: 'Point', coordinates: [50.435766, 30.515742] },
      distanceField: 'multiArea_distance',
      maxDistance: 1000,
      key: 'multiArea',
      spherical: true,
    };

    expect(result).toEqual(expectedResult);
  });
});
