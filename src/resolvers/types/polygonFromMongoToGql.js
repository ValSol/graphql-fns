// @flow

import type { GeospatialPolygon, MongodbGeospatialPolygon } from '../../flowTypes';

const polygonFromMongoToGql = (polygon: MongodbGeospatialPolygon): GeospatialPolygon => {
  const {
    coordinates: [externalRingArray, ...internalRingsArray],
  } = polygon;

  const externalRing = externalRingArray.reduce(
    (prev, item) => {
      const [longitude, latitude] = item;
      prev.ring.push({ longitude, latitude });
      return prev;
    },
    { ring: [] },
  );
  const result: GeospatialPolygon = { externalRing };

  if (internalRingsArray && internalRingsArray.length) {
    const internalRings = internalRingsArray.map(array =>
      array.reduce(
        (prev, item) => {
          const [longitude, latitude] = item;
          prev.ring.push({ longitude, latitude });
          return prev;
        },
        { ring: [] },
      ),
    );
    result.internalRings = internalRings;
  }
  return result;
};

export default polygonFromMongoToGql;
