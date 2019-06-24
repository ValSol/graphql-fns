// @flow

import type { GeospatialPoint, MongodbGeospatialPoint } from '../../flowTypes';

const pointFromMongoToGql = (point: MongodbGeospatialPoint): GeospatialPoint => {
  const {
    coordinates: [longitude, latitude],
  } = point;

  return { longitude, latitude };
};

export default pointFromMongoToGql;
