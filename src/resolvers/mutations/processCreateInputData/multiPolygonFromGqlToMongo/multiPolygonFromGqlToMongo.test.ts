/* eslint-env jest */
import type { GeospatialMultiPolygon, MongodbGeospatialMultiPolygon } from '../../../../tsTypes';

import multiPolygonFromGqlToMongo from '.';

describe('multiPolygonFromGqlToMongo', () => {
  test('should return null for null point', () => {
    const multiPolygon = null;

    const result = multiPolygonFromGqlToMongo(multiPolygon);

    const expectedResult = null;

    expect(result).toEqual(expectedResult);
  });

  test('should transform Mongodb geospatial multiPolygon format to gql format', () => {
    const multiPolygon: GeospatialMultiPolygon = {
      polygons: [
        {
          externalRing: {
            ring: [
              { lng: 0, lat: 0 },
              { lng: 3, lat: 6 },
              { lng: 6, lat: 1 },
              { lng: 0, lat: 0 },
            ],
          },
        },
      ],
    };

    const result = multiPolygonFromGqlToMongo(multiPolygon);

    const expectedResult: MongodbGeospatialMultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [0, 0],
            [3, 6],
            [6, 1],
            [0, 0],
          ],
        ],
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should transform Mongodb geospatial multiPolygon with multiple rings format to gql format', () => {
    const multiPolygon: GeospatialMultiPolygon = {
      polygons: [
        {
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
        },
      ],
    };

    const result = multiPolygonFromGqlToMongo(multiPolygon);

    const expectedResult: MongodbGeospatialMultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [
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
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
