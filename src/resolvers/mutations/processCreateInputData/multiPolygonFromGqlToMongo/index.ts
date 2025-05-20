import type { GeospatialMultiPolygon, MongodbGeospatialMultiPolygon } from '../../../../tsTypes';

import { composePolynomCoordinates } from '../polygonFromGqlToMongo';

const multiPolygonFromGqlToMongo = (
  multiPolygon: GeospatialMultiPolygon | null,
): MongodbGeospatialMultiPolygon | null => {
  if (multiPolygon === null) return null;

  const { polygons } = multiPolygon;

  const coordinates = polygons.reduce((prev, polygon) => {
    prev.push(composePolynomCoordinates(polygon));

    return prev;
  }, []);

  return { coordinates, type: 'MultiPolygon' as const };
};

export default multiPolygonFromGqlToMongo;
