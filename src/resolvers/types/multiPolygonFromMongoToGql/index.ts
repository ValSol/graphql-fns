import type { GeospatialMultiPolygon, MongodbGeospatialMultiPolygon } from '../../../tsTypes';
import { composeGqlRings } from '../polygonFromMongoToGql';

const multiPolygonFromMongoToGql = (
  multiPolygon: MongodbGeospatialMultiPolygon,
): GeospatialMultiPolygon => {
  const { coordinates } = multiPolygon;

  return coordinates.reduce(
    (prev, coordinates2) => {
      prev.polygons.push(composeGqlRings(coordinates2));

      return prev;
    },
    { polygons: [] },
  );
};

export default multiPolygonFromMongoToGql;
