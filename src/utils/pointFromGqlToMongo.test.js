// @flow
/* eslint-env jest */
import type { GeospatialPoint, MongodbGeospatialPoint } from '../flowTypes';

const pointFromGqlToMongo = require('./pointFromGqlToMongo');

describe('pointFromGqlToMongo', () => {
  test('should transform Mongodb geospatial point format to gql format', () => {
    const point: GeospatialPoint = { longitude: 40, latitude: 5 };

    const result: MongodbGeospatialPoint = pointFromGqlToMongo(point);

    const expectedResult = { type: 'Point', coordinates: [40, 5] };

    expect(result).toEqual(expectedResult);
  });
});
