// @flow

import type { GeospatialPoint, MongodbGeospatialPoint } from '../../flowTypes';

const pointFromGqlToMongo = (point: GeospatialPoint | null): MongodbGeospatialPoint | null => {
  if (point === null) return null;

  const { longitude, latitude } = point;

  return { type: 'Point', coordinates: [longitude, latitude] };
};

export default pointFromGqlToMongo;
