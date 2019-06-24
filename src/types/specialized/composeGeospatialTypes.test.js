// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeGeospatialTypes from './composeGeospatialTypes';

describe('composeGeospatialTypes', () => {
  test('should return empty string if there are not any geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const thingConfigs = [thingConfig];
    const generalConfig: GeneralConfig = { thingConfigs };
    const expectedResult = '';

    const result = composeGeospatialTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should return GeospatialPoint type if there are geospatial fields with type "Point"', () => {
    const thingConfig: ThingConfig = {
      name: 'Place',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const generalConfig: GeneralConfig = { thingConfigs };
    const expectedResult = `type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}`;

    const result = composeGeospatialTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return GeospatialPoint, GeospatialPolygonRing and GeospatialPolygon types if there are geospatial fields with type "Polygon"', () => {
    const thingConfig: ThingConfig = {
      name: 'District',
      geospatialFields: [
        {
          name: 'area',
          geospatialType: 'Polygon',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const generalConfig: GeneralConfig = { thingConfigs };
    const expectedResult = `type GeospatialPoint {
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
    const result = composeGeospatialTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
