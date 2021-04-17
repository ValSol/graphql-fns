// @flow
/* eslint-env jest */
import type { GeospatialPolygon, MongodbGeospatialPolygon } from '../../../flowTypes';

import polygonFromMongoToGql from './index';

describe('polygonFromMongoToGql', () => {
  test('should transform Mongodb geospatial polygon format to gql format', () => {
    const polygon: MongodbGeospatialPolygon = {
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

    const result: GeospatialPolygon = polygonFromMongoToGql(polygon);

    const expectedResult = {
      externalRing: {
        ring: [
          { lng: 0, lat: 0 },
          { lng: 3, lat: 6 },
          { lng: 6, lat: 1 },
          { lng: 0, lat: 0 },
        ],
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('should transform Mongodb geospatial polygon with multiple rings format to gql format', () => {
    const polygon: MongodbGeospatialPolygon = {
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

    const result: GeospatialPolygon = polygonFromMongoToGql(polygon);

    const expectedResult = {
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

    expect(result).toEqual(expectedResult);
  });
});
