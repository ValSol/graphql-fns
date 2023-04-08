import type {GeospatialPoint, MongodbGeospatialPoint} from '../../../tsTypes';

const pointFromMongoToGql = (point: MongodbGeospatialPoint): GeospatialPoint => {
  const {
    coordinates: [lng, lat],
  } = point;

  return { lng, lat };
};

export default pointFromMongoToGql;
