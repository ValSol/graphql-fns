/* eslint-env jest */
import type { GeospatialLineString, MongodbGeospatialLineString } from '@/tsTypes';

import lineStringFromGqlToMongo from '.';

describe('lineStringFromGqlToMongo', () => {
  test('should return null for null point', () => {
    const point = null;

    const result = lineStringFromGqlToMongo(point);

    const expectedResult = null;

    expect(result).toEqual(expectedResult);
  });

  test('should transform Mongodb geospatial lineString format to gql format', () => {
    const lineString: GeospatialLineString = {
      coordinates: [
        { lng: 30, lat: 50 },
        { lng: 31, lat: 51 },
      ],
    };

    const result = lineStringFromGqlToMongo(lineString);

    const expectedResult: MongodbGeospatialLineString = {
      type: 'LineString',
      coordinates: [
        [30, 50],
        [31, 51],
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
