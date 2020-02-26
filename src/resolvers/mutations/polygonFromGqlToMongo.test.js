// @flow
/* eslint-env jest */
import type { GeospatialPolygon, MongodbGeospatialPolygon } from '../../flowTypes';

import polygonFromGqlToMongo from './polygonFromGqlToMongo';

describe('polygonFromGqlToMongo', () => {
  test('should return null for null point', () => {
    const polygon = null;

    const result = polygonFromGqlToMongo(polygon);

    const expectedResult = null;

    expect(result).toEqual(expectedResult);
  });

  test('should transform Mongodb geospatial polygon format to gql format', () => {
    const polygon: GeospatialPolygon = {
      externalRing: {
        ring: [
          { lng: 0, lat: 0 },
          { lng: 3, lat: 6 },
          { lng: 6, lat: 1 },
          { lng: 0, lat: 0 },
        ],
      },
    };

    const result = polygonFromGqlToMongo(polygon);

    const expectedResult: MongodbGeospatialPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [3, 6],
          [6, 1],
          [0, 0],
        ],
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should transform Mongodb geospatial polygon with multiple rings format to gql format', () => {
    const polygon: GeospatialPolygon = {
      externalRing: {
        ring: [
          { lng: 0, lat: 0 },
          { lng: 3, lat: 6 },
          { lng: 6, lat: 1 },
          { lng: 0, lat: 0 },
        ],
      },
      internalRings: [
        {
          ring: [
            { lng: 2, lat: 2 },
            { lng: 3, lat: 3 },
            { lng: 4, lat: 2 },
            { lng: 2, lat: 2 },
          ],
        },
      ],
    };

    const result = polygonFromGqlToMongo(polygon);

    const expectedResult: MongodbGeospatialPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [3, 6],
          [6, 1],
          [0, 0],
        ],
        [
          [2, 2],
          [3, 3],
          [4, 2],
          [2, 2],
        ],
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
