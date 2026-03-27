import type { GeospatialMultiLineString, MongodbGeospatialMultiLineString } from '@/tsTypes';

const multiLineStringFromGqlToMongo = (
  multiLineString: GeospatialMultiLineString | null,
): MongodbGeospatialMultiLineString | null => {
  if (multiLineString === null) return null;

  const { lineStrings } = multiLineString;

  const coordinates = lineStrings.reduce((prev, lineString) => {
    prev.push(lineString.coordinates.map(({ lat, lng }) => [lng, lat]));

    return prev;
  }, []);

  return { coordinates, type: 'MultiLineString' as const };
};

export default multiLineStringFromGqlToMongo;
