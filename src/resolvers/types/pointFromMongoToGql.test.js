// @flow
/* eslint-env jest */
import type { GeospatialPoint, MongodbGeospatialPoint } from '../../flowTypes';

const pointFromMongoToGql = require('./pointFromMongoToGql');

describe('pointFromMongoToGql', () => {
  test('should transform Mongodb geospatial point format to gql format', () => {
    const point: MongodbGeospatialPoint = { type: 'Point', coordinates: [40, 5] };

    const result: GeospatialPoint = pointFromMongoToGql(point);

    const expectedResult = { longitude: 40, latitude: 5 };

    expect(result).toEqual(expectedResult);
  });
});
