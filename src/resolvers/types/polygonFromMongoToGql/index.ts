import type { GeospatialPolygon, MongodbGeospatialPolygon } from '../../../tsTypes';

export const composeGqlRings = (coordinates: [number, number][][]) => {
  const [externalRingArray, ...internalRingsArray] = coordinates;

  const externalRing = externalRingArray.reduce(
    (prev, item) => {
      const [lng, lat] = item;
      prev.ring.push({ lng, lat });
      return prev;
    },
    { ring: [] },
  );

  if (internalRingsArray && internalRingsArray.length) {
    const internalRings = internalRingsArray.map((array) =>
      array.reduce(
        (prev, item) => {
          const [lng, lat] = item;
          prev.ring.push({ lng, lat });
          return prev;
        },
        { ring: [] },
      ),
    );
    return { externalRing, internalRings };
  }
  return { externalRing };
};

const polygonFromMongoToGql = (polygon: MongodbGeospatialPolygon): GeospatialPolygon => {
  const { coordinates } = polygon;

  return composeGqlRings(coordinates);
};

export default polygonFromMongoToGql;
