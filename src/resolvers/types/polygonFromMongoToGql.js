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
    return { externalRing, internalRings };
  }
  return { externalRing };
};

export default polygonFromMongoToGql;
