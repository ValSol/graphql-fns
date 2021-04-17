// @flow

import type { GeospatialPolygon, MongodbGeospatialPolygon } from '../../../flowTypes';

const polygonFromGqlToMongo = (
  polygon: GeospatialPolygon | null,
): MongodbGeospatialPolygon | null => {
  if (polygon === null) return null;

  const {
    externalRing: { ring: externalRing },
    internalRings,
  } = polygon;

  const exteranlRing2 = externalRing.map(({ lng, lat }) => [lng, lat]);

  const result = { coordinates: [exteranlRing2], type: 'Polygon' };

  if (internalRings && internalRings.length) {
    const internalRings2 = internalRings.map(({ ring: array }) =>
      array.map(({ lng, lat }) => [lng, lat]),
    );

    result.coordinates = [...result.coordinates, ...internalRings2];
  }

  return result;
};

export default polygonFromGqlToMongo;
