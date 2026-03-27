/* eslint-env jest */
import type { GeospatialLineString, MongodbGeospatialLineString } from '@/tsTypes';

import lineStringFromMongoToGql from '.';

describe('lineStringFromMongoToGql', () => {
  test('should transform Mongodb geospatial lineString format to gql format', () => {
    const lineString: MongodbGeospatialLineString = {
      type: 'LineString',
      coordinates: [
        [30, 50],
        [31, 51],
      ],
    };

    const result: GeospatialLineString = lineStringFromMongoToGql(lineString);

    const expectedResult = {
      coordinates: [
        { lat: 50, lng: 30 },
        { lat: 51, lng: 31 },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
