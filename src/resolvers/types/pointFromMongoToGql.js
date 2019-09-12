// @flow

import type { GeospatialPoint, MongodbGeospatialPoint } from '../../flowTypes';

const pointFromMongoToGql = (point: MongodbGeospatialPoint): GeospatialPoint => {
  const {
    coordinates: [lng, lat],
  } = point;

  return { lng, lat };
};

export default pointFromMongoToGql;
