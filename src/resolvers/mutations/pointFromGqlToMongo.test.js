// @flow
/* eslint-env jest */
import type { GeospatialPoint, MongodbGeospatialPoint } from '../../flowTypes';

const pointFromGqlToMongo = require('./pointFromGqlToMongo');

describe('pointFromGqlToMongo', () => {
  test('should return null for null point', () => {
    const point = null;

    const result = pointFromGqlToMongo(point);

    const expectedResult = null;

    expect(result).toEqual(expectedResult);
  });

  test('should transform Mongodb geospatial point format to gql format', () => {
    const point: GeospatialPoint = { longitude: 40, latitude: 5 };

    const result = pointFromGqlToMongo(point);

    const expectedResult: MongodbGeospatialPoint = { type: 'Point', coordinates: [40, 5] };

    expect(result).toEqual(expectedResult);
  });
});
