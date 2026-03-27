import type { GeospatialMultiLineString, MongodbGeospatialMultiLineString } from '@/tsTypes';
import { composeGqlRings } from '../polygonFromMongoToGql';
import lineStringFromMongoToGql from '../lineStringFromMongoToGql';

const multiLineStringFromMongoToGql = (
  multiLineString: MongodbGeospatialMultiLineString,
): GeospatialMultiLineString => {
  const { coordinates } = multiLineString;

  return coordinates.reduce(
    (prev, coordinates2) => {
      prev.lineStrings.push(
        lineStringFromMongoToGql({
          type: 'LineString',
          coordinates: coordinates2,
        }),
      );

      return prev;
    },
    { lineStrings: [] },
  );
};

export default multiLineStringFromMongoToGql;
