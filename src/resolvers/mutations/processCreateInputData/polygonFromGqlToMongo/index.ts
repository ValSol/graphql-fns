import type { GeospatialPolygon, MongodbGeospatialPolygon } from '../../../../tsTypes';

export const composePolynomCoordinates = (polygon: GeospatialPolygon): [number, number][][] => {
  const { externalRing, internalRings = [] } = polygon;

  return [
    externalRing.ring.map(({ lng, lat }) => [lng, lat]),
    ...internalRings.map(({ ring: ring2 }) =>
      ring2.map(({ lng, lat }) => [lng, lat] as [number, number]),
    ),
  ];
};

const polygonFromGqlToMongo = (
  polygon: GeospatialPolygon | null,
): MongodbGeospatialPolygon | null => {
  if (polygon === null) return null;

  const coordinates = composePolynomCoordinates(polygon);

  return { coordinates, type: 'Polygon' as const };
};

export default polygonFromGqlToMongo;
