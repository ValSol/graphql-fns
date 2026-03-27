/* eslint-env jest */
import type { GeospatialMultiLineString, MongodbGeospatialMultiLineString } from '../../../tsTypes';

import multiLineStringFromMongoToGql from '.';

describe('multiLineStringFromMongoToGql', () => {
  test('should transform Mongodb geospatial multiLineString format to gql format', () => {
    const multiLineString: MongodbGeospatialMultiLineString = {
      type: 'MultiLineString',
      coordinates: [
        [
          [0, 0],
          [3, 6],
          [6, 1],
        ],
      ],
    };

    const result: GeospatialMultiLineString = multiLineStringFromMongoToGql(multiLineString);

    const expectedResult = {
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

    expect(result).toEqual(expectedResult);
  });
});
