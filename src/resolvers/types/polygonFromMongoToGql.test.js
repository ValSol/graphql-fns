// @flow
/* eslint-env jest */
import type { GeospatialPolygon, MongodbGeospatialPolygon } from '../../flowTypes';

const polygonFromMongoToGql = require('./polygonFromMongoToGql');

describe('polygonFromMongoToGql', () => {
  test('should transform Mongodb geospatial polygon format to gql format', () => {
    const polygon: MongodbGeospatialPolygon = {
      type: 'Polygon',
      coordinates: [[[0, 0], [3, 6], [6, 1], [0, 0]]],
    };

    const result: GeospatialPolygon = polygonFromMongoToGql(polygon);

    const expectedResult = {
      externalRing: {
        ring: [
          { longitude: 0, latitude: 0 },
          { longitude: 3, latitude: 6 },
          { longitude: 6, latitude: 1 },
          { longitude: 0, latitude: 0 },
        ],
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('should transform Mongodb geospatial polygon with multiple rings format to gql format', () => {
    const polygon: MongodbGeospatialPolygon = {
      type: 'Polygon',
      coordinates: [[[0, 0], [3, 6], [6, 1], [0, 0]], [[2, 2], [3, 3], [4, 2], [2, 2]]],
    };

    const result: GeospatialPolygon = polygonFromMongoToGql(polygon);

    const expectedResult = {
      externalRing: {
        ring: [
          { longitude: 0, latitude: 0 },
          { longitude: 3, latitude: 6 },
          { longitude: 6, latitude: 1 },
          { longitude: 0, latitude: 0 },
        ],
      },
      internalRings: [
        {
          ring: [
            { longitude: 2, latitude: 2 },
            { longitude: 3, latitude: 3 },
            { longitude: 4, latitude: 2 },
            { longitude: 2, latitude: 2 },
          ],
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
