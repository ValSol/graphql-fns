/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../tsTypes';

import composeGeospatialTypes from './composeGeospatialTypes';

describe('composeGeospatialTypes', () => {
  test('should return empty string if there are not any geospatial fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const allEntityConfigs = { Example: entityConfig };
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const expectedResult = '';

    const result = composeGeospatialTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should return GeospatialPoint type if there are geospatial fields with type "Point"', () => {
    const entityConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
      ],
    };
    const allEntityConfigs = { Place: entityConfig };
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const expectedResult = `type GeospatialPoint {
  lng: Float!
  lat: Float!
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
input GeospatialSphereInput {
  center: GeospatialPointInput!
  radius: Float!
}`;

    const result = composeGeospatialTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return GeospatialPoint, GeospatialPolygonRing and GeospatialPolygon types if there are geospatial fields with type "Polygon"', () => {
    const entityConfig: EntityConfig = {
      name: 'District',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'area',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
      ],
    };
    const allEntityConfigs = { District: entityConfig };
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const expectedResult = `type GeospatialPoint {
  lng: Float!
  lat: Float!
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
input GeospatialSphereInput {
  center: GeospatialPointInput!
  radius: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
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

  test('multiPolygon', () => {
    const entityConfig: EntityConfig = {
      name: 'District',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'area',
          geospatialType: 'MultiPolygon',
          type: 'geospatialFields',
        },
      ],
    };
    const allEntityConfigs = { District: entityConfig };
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const expectedResult = `type GeospatialPoint {
  lng: Float!
  lat: Float!
}
input GeospatialPointInput {
  lng: Float!
  lat: Float!
}
input GeospatialSphereInput {
  center: GeospatialPointInput!
  radius: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  externalRing: GeospatialPolygonRingInput!
  internalRings: [GeospatialPolygonRingInput!]
}
type GeospatialMultiPolygon {
  polygons: [GeospatialPolygon!]!
}
input GeospatialMultiPolygonInput {
  polygons: [GeospatialPolygonInput!]!
}`;
    const result = composeGeospatialTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
