/* eslint-env jest */
import type { GeospatialMultiLineString, MongodbGeospatialMultiLineString } from '@/tsTypes';

import multiLineStringFromGqlToMongo from '.';

describe('multiLineStringFromGqlToMongo', () => {
  test('should return null for null point', () => {
    const multiLineString = null;

    const result = multiLineStringFromGqlToMongo(multiLineString);

    const expectedResult = null;

    expect(result).toEqual(expectedResult);
  });

  test('should transform Mongodb geospatial multiLineString format to gql format', () => {
    const multiLineString: GeospatialMultiLineString = {
      lineStrings: [
        {
          coordinates: [
            { lng: 0, lat: 0 },
            { lng: 3, lat: 6 },
            { lng: 6, lat: 1 },
          ],
        },
      ],
    };

    const result = multiLineStringFromGqlToMongo(multiLineString);

    const expectedResult: MongodbGeospatialMultiLineString = {
      type: 'MultiLineString',
      coordinates: [
        [
          [0, 0],
          [3, 6],
          [6, 1],
        ],
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
