import type { GeospatialPoint, MongodbGeospatialPoint } from '../../../../tsTypes';

const pointFromGqlToMongo = (point: GeospatialPoint | null): MongodbGeospatialPoint | null => {
  if (point === null) return null;

  const { lng, lat } = point;

  return { type: 'Point', coordinates: [lng, lat] };
};

export default pointFromGqlToMongo;
