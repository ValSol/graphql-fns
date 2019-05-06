// @flow

import type { GeneralConfig } from '../../flowTypes';

const composeGeospatialTypes = (generalConfig: GeneralConfig): string => {
  const { thingConfigs } = generalConfig;
  let thereIsGeospatialPoint = false;
  let thereIsGeospatialPolygon = false;

  for (let i = 0; i < thingConfigs.length; i += 1) {
    const thingConfig = thingConfigs[i];
    const { geospatialFields } = thingConfig;
    if (geospatialFields && geospatialFields.some(({ type }) => type === 'Point')) {
      thereIsGeospatialPoint = true;
    }
    if (geospatialFields && geospatialFields.some(({ type }) => type === 'Polygon')) {
      thereIsGeospatialPolygon = true;
      break;
    }
  }

  if (thereIsGeospatialPolygon) {
    return `
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  externalRing: GeospatialPolygonRingInput!
  internalRings: [GeospatialPolygonRingInput!]
}`;
  }

  if (thereIsGeospatialPoint) {
    return `
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}`;
  }

  return '';
};

module.exports = composeGeospatialTypes;
