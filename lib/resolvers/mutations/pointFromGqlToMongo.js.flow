// @flow

import type { GeospatialPoint, MongodbGeospatialPoint } from '../../flowTypes';

const pointFromGqlToMongo = (point: GeospatialPoint): MongodbGeospatialPoint => {
  const { longitude, latitude } = point;

  return { type: 'Point', coordinates: [longitude, latitude] };
};

module.exports = pointFromGqlToMongo;
