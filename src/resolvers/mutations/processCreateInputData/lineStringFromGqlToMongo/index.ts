import type { GeospatialLineString, MongodbGeospatialLineString } from '@/tsTypes';

const lineStringFromGqlToMongo = (
  lineString: GeospatialLineString | null,
): MongodbGeospatialLineString | null => {
  if (lineString === null) return null;

  const { coordinates } = lineString;

  return { type: 'LineString', coordinates: coordinates.map(({ lat, lng }) => [lng, lat]) };
};

export default lineStringFromGqlToMongo;
