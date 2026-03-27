import type { GeospatialLineString, MongodbGeospatialLineString } from '@/tsTypes';

const lineStringFromMongoToGql = (
  lineString: MongodbGeospatialLineString,
): GeospatialLineString => ({
  coordinates: lineString.coordinates.map(([lng, lat]) => ({ lat, lng })),
});

export default lineStringFromMongoToGql;
