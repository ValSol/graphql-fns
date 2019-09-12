// @flow
/* eslint-env jest */
import type { GeospatialPoint, MongodbGeospatialPoint } from '../../flowTypes';

import pointFromMongoToGql from './pointFromMongoToGql';

describe('pointFromMongoToGql', () => {
  test('should transform Mongodb geospatial point format to gql format', () => {
    const point: MongodbGeospatialPoint = { type: 'Point', coordinates: [40, 5] };

    const result: GeospatialPoint = pointFromMongoToGql(point);

    const expectedResult = { lng: 40, lat: 5 };

    expect(result).toEqual(expectedResult);
  });
});
