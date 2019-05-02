// @flow

import type { GeospatialPolygon, MongodbGeospatialPolygon } from '../../flowTypes';

const polygonFromMongoToGql = (point: MongodbGeospatialPolygon): GeospatialPolygon => {
  const {
    coordinates: [externalRingArray, ...internalRingsArray],
  } = point;

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

module.exports = polygonFromMongoToGql;
