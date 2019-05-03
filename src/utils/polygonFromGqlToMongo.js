// @flow

import type { GeospatialPolygon, MongodbGeospatialPolygon } from '../flowTypes';

const polygonFromGqlToMongo = (polygon: GeospatialPolygon): MongodbGeospatialPolygon => {
  const {
    externalRing: { ring: externalRing },
    internalRings,
  } = polygon;

  const exteranlRing2 = externalRing.map(({ longitude, latitude }) => [longitude, latitude]);

  const result = { coordinates: [exteranlRing2], type: 'Polygon' };

  if (internalRings && internalRings.length) {
    const internalRings2 = internalRings.map(({ ring: array }) =>
      array.map(({ longitude, latitude }) => [longitude, latitude]),
    );

    result.coordinates = [...result.coordinates, ...internalRings2];
  }

  return result;
};

module.exports = polygonFromGqlToMongo;