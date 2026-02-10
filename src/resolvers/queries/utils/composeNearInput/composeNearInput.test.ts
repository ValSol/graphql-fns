/* eslint-env jest */
import type { EntityConfig, NearInput, NearMongodb } from '@/tsTypes';

import composeNearInput from '.';

describe('composeNearInput', () => {
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

    const result = composeNearInput(near, entityConfig);

    const expectedResult: NearMongodb = {
      'position.coordinates': {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [50.435766, 30.515742] },
          $maxDistance: 1000,
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('Polygon', () => {
    const near: NearInput = {
      geospatialField: 'area',
      coordinates: { lng: 50.435766, lat: 30.515742 },
      maxDistance: 1000,
    };

    const result = composeNearInput(near, entityConfig);

    const expectedResult: NearMongodb = {
      area: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [50.435766, 30.515742] },
          $maxDistance: 1000,
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('MultiPolygon', () => {
    const near: NearInput = {
      geospatialField: 'multiArea',
      coordinates: { lng: 50.435766, lat: 30.515742 },
      maxDistance: 1000,
    };

    const result = composeNearInput(near, entityConfig);

    const expectedResult: NearMongodb = {
      multiArea: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [50.435766, 30.515742] },
          $maxDistance: 1000,
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
